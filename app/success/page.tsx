import Footer from "../../components/Footer";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { createSupabaseAdmin } from "../../lib/supabaseAdmin";
import SaveTicketPdfButton from "../../components/SaveTicketPdfButton";

type SuccessPageProps = {
  searchParams: Promise<{ registration_number?: string | string[] }>;
};

type RegistrationSummary = {
  registration_number: string;
  full_name: string;
  phone: string;
  national_id: string;
  address: string;
  date_of_birth: string;
  gender: "male" | "female";
  eligibility_type: "resident" | "mahdara_student";
  mahdara_name: string | null;
  category: "children" | "adults";
  status: string;
};

function toArabicGender(gender: "male" | "female") {
  return gender === "male" ? "ذكر" : "أنثى";
}

function toArabicCategory(category: "children" | "adults") {
  return category === "children" ? "الفئة تحت 12 سنة" : "الفئة من ١٢سنه الي ٢٥ سنة";
}

function toArabicEligibility(type: "resident" | "mahdara_student") {
  return type === "resident" ? "مقيم" : "طالب محظرة";
}

function toArabicStatus(status: string) {
  if (status === "pending") return "قيد المراجعة";
  if (status === "approved") return "مقبول";
  if (status === "rejected") return "مرفوض";
  return status;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const registrationParam = resolvedSearchParams.registration_number;
  const registrationNumber = Array.isArray(registrationParam)
    ? registrationParam[0]?.trim()
    : registrationParam?.trim();
  let summary: RegistrationSummary | null = null;

  if (registrationNumber) {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("participants")
      .select("registration_number,full_name,phone,national_id,address,date_of_birth,gender,eligibility_type,mahdara_name,category,status")
      .eq("registration_number", registrationNumber)
      .maybeSingle();

    if (!error && data) {
      summary = data as RegistrationSummary;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="no-print">
        <Navbar />
      </div>
      <main className="print-ticket-wrapper mx-auto flex min-h-[calc(100vh-160px)] max-w-4xl flex-col items-center justify-center px-4 py-8 text-right sm:px-6 lg:px-8">
        <section className="print-ticket-card w-full rounded-[2rem] border border-emerald-100 bg-white/90 p-8 shadow-[0_18px_50px_rgba(4,58,51,0.05)]">
          <h1 className="text-3xl font-semibold text-emerald-950">تم استلام طلبك</h1>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            شكراً لك على تسجيلك في المسابقة الثالثة للسيرة النبوية. ستتم مراجعة طلبك لاحقاً ضمن إجراءات المسابقة.
          </p>

          {registrationNumber ? (
            <div className="mt-8 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-right" id="ticket">
              <p className="text-sm font-semibold text-emerald-900">تذكرة التسجيل</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{registrationNumber}</p>

              {summary ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">الاسم الكامل</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{summary.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">رقم الهاتف</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{summary.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">رقم بطاقة التعريف</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{summary.national_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">تاريخ الميلاد</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{summary.date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">الجنس</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{toArabicGender(summary.gender)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">الفئة</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{toArabicCategory(summary.category)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">نوع الأهلية</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{toArabicEligibility(summary.eligibility_type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">الحالة</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{toArabicStatus(summary.status)}</p>
                  </div>
                  {summary.mahdara_name ? (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-500">اسم المحظرة</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{summary.mahdara_name}</p>
                    </div>
                  ) : null}
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500">العنوان</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{summary.address}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-700">تعذر تحميل ملخص التسجيل حالياً، ولكن رقم التسجيل صالح للمتابعة.</p>
              )}

              <p className="mt-5 text-sm text-slate-700">يرجى تصوير هذه التذكرة أو حفظها كملف PDF أو طباعتها للرجوع إليها لاحقاً.</p>
              <div className="no-print mt-4">
                <SaveTicketPdfButton />
              </div>
            </div>
          ) : null}

          <div className="no-print mt-8 space-y-4">
            <Link href="/" className="inline-flex rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
              العودة إلى الصفحة الرئيسية
            </Link>
            <Link href="/competition" className="inline-flex rounded-full border border-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50">
              معرفة المزيد عن المسابقة
            </Link>
          </div>
        </section>
      </main>
      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
