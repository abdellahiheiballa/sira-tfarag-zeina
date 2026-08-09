import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const username = body?.username;
    const password = body?.password;

    if (username !== "admin" || password !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select(
        "id,registration_number,full_name,date_of_birth,gender,phone,national_id,address,eligibility_type,mahdara_name,category,status"
      )
      .order("id", { ascending: false });

    if (participantsError) {
      console.error("Admin submissions participants error", participantsError);
      return NextResponse.json({ error: "فشل تحميل التسجيلات." }, { status: 500 });
    }

    const { data: documents, error: documentsError } = await supabase
      .from("participant_documents")
      .select(
        "participant_id,document_type,storage_path,original_filename,mime_type,file_size"
      );

    if (documentsError) {
      console.error("Admin submissions documents error", documentsError);
      return NextResponse.json({ error: "فشل تحميل ملفات التسجيل." }, { status: 500 });
    }

    const documentUrls = await Promise.all(
      (documents ?? []).map(async (document) => {
        const { data, error } = await supabase
          .storage
          .from("participant-documents")
          .createSignedUrl(document.storage_path, 60 * 60);

        if (error) {
          console.error("Signed URL generation error", error, document.storage_path);
          return { ...document, url: null };
        }

        return { ...document, url: data?.signedUrl ?? null };
      })
    );

    const submissions = (participants ?? []).map((participant) => ({
      ...participant,
      documents: documentUrls.filter((doc) => doc.participant_id === participant.id),
    }));

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Unexpected admin submissions error", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع." }, { status: 500 });
  }
}
