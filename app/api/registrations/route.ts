import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { createRegistrationNumber } from "../../../lib/registrationNumber";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAURITANIA_PHONE_REGEX = /^[234]\d{7}$/;
const MAURITANIA_NATIONAL_ID_REGEX = /^\d{10}$/;

const RegistrationBodySchema = z.object({
  full_name: z.string().min(3, "يرجى إدخال الاسم الكامل"),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "يرجى إدخال تاريخ ميلاد صالح"),
  gender: z.enum(["male", "female"], "يرجى اختيار الجنس"),
  phone: z.string().regex(MAURITANIA_PHONE_REGEX, "يرجى إدخال رقم هاتف موريتاني محلي صالح مكون من 8 أرقام يبدأ بـ 2 أو 3 أو 4."),
  national_id: z.string().regex(MAURITANIA_NATIONAL_ID_REGEX, "يرجى إدخال رقم بطاقة تعريف موريتاني صالح مكون من 10 أرقام."),
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

    const supabase = createSupabaseAdmin();

    const duplicateCheckByNationalId = await supabase
      .from("participants")
      .select("id")
      .eq("national_id", form.national_id)
      .limit(1)
      .maybeSingle();

    if (duplicateCheckByNationalId.error) {
      console.error("Supabase duplicate check error (national_id)", JSON.stringify(duplicateCheckByNationalId.error, null, 2));
      if (duplicateCheckByNationalId.error.code === "42501") {
        return NextResponse.json({ error: "خطأ في إعدادات Supabase: صلاحيات جدول المشاركين غير كافية." }, { status: 500 });
      }
      return NextResponse.json({ error: "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقاً." }, { status: 500 });
    }

    const duplicateCheckByPhone = await supabase
      .from("participants")
      .select("id")
      .eq("phone", form.phone)
      .limit(1)
      .maybeSingle();

    if (duplicateCheckByPhone.error) {
      console.error("Supabase duplicate check error (phone)", JSON.stringify(duplicateCheckByPhone.error, null, 2));
      if (duplicateCheckByPhone.error.code === "42501") {
        return NextResponse.json({ error: "خطأ في إعدادات Supabase: صلاحيات جدول المشاركين غير كافية." }, { status: 500 });
      }
      return NextResponse.json({ error: "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقاً." }, { status: 500 });
    }

    if (duplicateCheckByNationalId.data || duplicateCheckByPhone.data) {
      return NextResponse.json({ error: "لا يمكن تسجيل طلب مماثل في الوقت الحالي. يرجى التواصل مع الجهة المنظمة إذا كنت تعتقد أن ذلك خطأ." }, { status: 409 });
    }

    const participantInsert = await supabase.from("participants").insert({
      registration_number: "",
      full_name: form.full_name.trim(),
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      phone: form.phone.trim(),
      national_id: form.national_id.trim(),
      address: form.address.trim(),
      eligibility_type: form.eligibility_type,
      mahdara_name: form.mahdara_name?.trim() ?? null,
      category,
      status: "pending",
    }).select("id").single();

    if (participantInsert.error || !participantInsert.data?.id) {
      console.error("Supabase participant insert error", participantInsert.error);
      return NextResponse.json({ error: "فشل إنشاء التسجيل. يرجى المحاولة لاحقاً." }, { status: 500 });
    }

    const participantId = participantInsert.data.id;
    const registration_number = createRegistrationNumber(participantId);

    const registrationUpdate = await supabase
      .from("participants")
      .update({ registration_number })
      .eq("id", participantId)
      .select("registration_number")
      .single();

    if (registrationUpdate.error || !registrationUpdate.data?.registration_number) {
      console.error("Supabase registration number update error", registrationUpdate.error);
      await supabase.from("participants").delete().eq("id", participantId);
      return NextResponse.json({ error: "فشل إنشاء رقم التسجيل. يرجى المحاولة لاحقاً." }, { status: 500 });
    }

    const uploadFile = async (file: File, documentType: string, folder: string) => {
      const uniqueName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const storagePath = `participants/${participantId}/${folder}/${uniqueName}`;
      const uploadResult = await supabase.storage.from("participant-documents").upload(storagePath, file.stream(), {
        contentType: file.type,
      });
      if (uploadResult.error) {
        return { success: false, error: uploadResult.error, storagePath };
      }
      return { success: true, metadata: { documentType, storagePath, originalFilename: file.name, mimeType: file.type, fileSize: file.size } };
    };

    const uploadedFiles = [] as Array<{ documentType: string; storagePath: string; originalFilename: string; mimeType: string; fileSize: number }>;

    try {
      const nationalUpload = await uploadFile(nationalIdFile, "national_id", "national-id");
      if (!nationalUpload.success) throw nationalUpload;
      uploadedFiles.push(nationalUpload.metadata!);

      if (residenceFile) {
        const residenceUpload = await uploadFile(residenceFile, "residence_certificate", "residence");
        if (!residenceUpload.success) throw residenceUpload;
        uploadedFiles.push(residenceUpload.metadata!);
      }

      if (mahdaraFile) {
        const mahdaraUpload = await uploadFile(mahdaraFile, "mahdara_certificate", "mahdara");
        if (!mahdaraUpload.success) throw mahdaraUpload;
        uploadedFiles.push(mahdaraUpload.metadata!);
      }

      const metadataInserts = uploadedFiles.map((fileMeta) => ({
        participant_id: participantId,
        document_type: fileMeta.documentType,
        storage_path: fileMeta.storagePath,
        original_filename: fileMeta.originalFilename,
        mime_type: fileMeta.mimeType,
        file_size: fileMeta.fileSize,
      }));

      const metadataResult = await supabase.from("participant_documents").insert(metadataInserts);
      if (metadataResult.error) {
        console.error("Supabase metadata insert error", metadataResult.error);
        throw { error: metadataResult.error };
      }
    } catch (uploadError) {
      console.error("File upload or metadata save error", uploadError);
      await Promise.all(
        uploadedFiles.map((fileMeta) =>
          supabase.storage.from("participant-documents").remove([fileMeta.storagePath])
        )
      );
      await supabase.from("participants").delete().eq("id", participantId);
      return NextResponse.json({ error: "فشل تحميل المستندات. يرجى المحاولة مرة أخرى." }, { status: 500 });
    }

    return NextResponse.json({
      registration_number,
      full_name: form.full_name.trim(),
      category,
    }, { status: 201 });
  } catch (error) {
    console.error("Unexpected registration API error", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." }, { status: 500 });
  }
}
