import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { prisma } from "../../../lib/prisma";
import { createRegistrationNumber } from "../../../lib/registrationNumber";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const RegistrationBodySchema = z.object({
  full_name: z.string().min(3, "يرجى إدخال الاسم الكامل"),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "يرجى إدخال تاريخ ميلاد صالح"),
  gender: z.enum(["male", "female"], "يرجى اختيار الجنس"),
  phone: z.string().min(6, "يرجى إدخال رقم الهاتف"),
  national_id: z.string().min(6, "يرجى إدخال رقم بطاقة التعريف الوطنية"),
  address: z.string().min(5, "يرجى إدخال العنوان"),
  eligibility_type: z.enum(["resident", "mahdara_student"], "يرجى اختيار نوع الأهلية"),
  mahdara_name: z.string().optional(),
});

function calculateAge(dateOfBirth: string) {
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

async function parseMultipartForm(request: Request) {
  const formData = await request.formData();
  const files: Record<string, File | null> = {
    national_id_file: null,
    residence_document: null,
    mahdara_document: null,
  };

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (key in files) {
        files[key as keyof typeof files] = value;
      }
    }
  }

  return { formData, files };
}

export async function POST(request: Request) {
  try {
    const { formData, files } = await parseMultipartForm(request);

    const payload = {
      full_name: formData.get("full_name")?.toString() ?? "",
      date_of_birth: formData.get("date_of_birth")?.toString() ?? "",
      gender: formData.get("gender")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      national_id: formData.get("national_id")?.toString() ?? "",
      address: formData.get("address")?.toString() ?? "",
      eligibility_type: formData.get("eligibility_type")?.toString() ?? "",
      mahdara_name: formData.get("mahdara_name")?.toString() ?? "",
    };

    const parsed = RegistrationBodySchema.safeParse(payload);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const form = parsed.data;

    if (form.eligibility_type === "mahdara_student" && !form.mahdara_name?.trim()) {
      return NextResponse.json({ error: "يرجى إدخال اسم المحظرة" }, { status: 400 });
    }

    const nationalIdFile = files.national_id_file;
    const residenceFile = files.residence_document;
    const mahdaraFile = files.mahdara_document;

    if (!nationalIdFile) {
      return NextResponse.json({ error: "يرجى إرفاق صورة بطاقة التعريف الوطنية" }, { status: 400 });
    }

    if (!residenceFile && !mahdaraFile) {
      return NextResponse.json({ error: "يرجى إرفاق شهادة إقامة أو إفادة محظرية" }, { status: 400 });
    }

    if (residenceFile && mahdaraFile) {
      return NextResponse.json({ error: "يرجى إرفاق ملف واحد فقط من شهادة الإقامة أو إفادة المحظرة" }, { status: 400 });
    }

    const age = calculateAge(form.date_of_birth);
    if (age === null) {
      return NextResponse.json({ error: "يرجى إدخال تاريخ ميلاد صالح" }, { status: 400 });
    }

    let category: string;
    if (age < 12) {
      category = "children";
    } else if (age >= 12 && age <= 25) {
      category = "adults";
    } else {
      return NextResponse.json({ error: "الفئة العمرية أكبر من 25 سنة غير مشمولة بالمشاركة" }, { status: 400 });
    }

    const fileCandidates = [nationalIdFile, residenceFile ?? null, mahdaraFile ?? null].filter(Boolean) as File[];
    for (const file of fileCandidates) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "نوع الملف غير مدعوم، يُسمح فقط بالصور أو PDF" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "حجم الملف كبير جداً، يرجى اختيار ملف أقل من 5 ميغابايت" }, { status: 400 });
      }
    }

    const duplicate = await prisma.participant.findFirst({
      where: {
        OR: [{ nationalId: form.national_id }, { phone: form.phone }],
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "لا يمكن تسجيل طلب مماثل في الوقت الحالي. يرجى التواصل مع الجهة المنظمة إذا كنت تعتقد أن ذلك خطأ." },
        { status: 409 }
      );
    }

    const participant = await prisma.participant.create({
      data: {
        registrationNumber: "",
        fullName: form.full_name.trim(),
        dateOfBirth: form.date_of_birth,
        gender: form.gender,
        phone: form.phone.trim(),
        nationalId: form.national_id.trim(),
        address: form.address.trim(),
        eligibilityType: form.eligibility_type,
        mahdaraName: form.mahdara_name?.trim() ?? null,
        category,
        status: "pending",
      },
    });

    const registration_number = createRegistrationNumber(participant.id);

    await prisma.participant.update({
      where: { id: participant.id },
      data: { registrationNumber: registration_number },
    });

    const uploadFile = async (file: File, documentType: string, folder: string) => {
      const uniqueName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const pathname = `participants/${participant.id}/${folder}/${uniqueName}`;
      const blob = await put(pathname, file, {
        access: "private",
        contentType: file.type,
      });
      return { documentType, storagePath: blob.url, originalFilename: file.name, mimeType: file.type, fileSize: file.size };
    };

    const uploadedFiles = [] as Array<{ documentType: string; storagePath: string; originalFilename: string; mimeType: string; fileSize: number }>;

    try {
      uploadedFiles.push(await uploadFile(nationalIdFile, "national_id", "national-id"));
      if (residenceFile) uploadedFiles.push(await uploadFile(residenceFile, "residence_document", "residence"));
      if (mahdaraFile) uploadedFiles.push(await uploadFile(mahdaraFile, "mahdara_document", "mahdara"));

      await prisma.participantDocument.createMany({
        data: uploadedFiles.map((fileMeta) => ({
          participantId: participant.id,
          documentType: fileMeta.documentType,
          storagePath: fileMeta.storagePath,
          originalFilename: fileMeta.originalFilename,
          mimeType: fileMeta.mimeType,
          fileSize: fileMeta.fileSize,
        })),
      });
    } catch (uploadError) {
      await Promise.all(uploadedFiles.map((fileMeta) => del(fileMeta.storagePath).catch(() => {})));
      await prisma.participant.delete({ where: { id: participant.id } });
      return NextResponse.json({ error: "فشل تحميل المستندات. يرجى المحاولة مرة أخرى." }, { status: 500 });
    }

    return NextResponse.json(
      { registration_number, full_name: form.full_name.trim(), category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected registration API error", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." }, { status: 500 });
  }
}
