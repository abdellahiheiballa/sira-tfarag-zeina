import Footer from "../../components/Footer";
import Link from "next/link";
import Navbar from "../../components/Navbar";

type SuccessPageProps = {
  searchParams: { registration_number?: string };
};

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-160px)] max-w-4xl flex-col items-center justify-center px-4 py-8 text-right sm:px-6 lg:px-8">
        <section className="w-full rounded-[2rem] border border-emerald-100 bg-white/90 p-8 shadow-[0_18px_50px_rgba(4,58,51,0.05)]">
          <h1 className="text-3xl font-semibold text-emerald-950">تم استلام طلبك</h1>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            شكراً لك على تسجيلك في المسابقة الثالثة للسيرة النبوية. ستتم مراجعة طلبك لاحقاً ضمن إجراءات المسابقة.
          </p>
          {searchParams.registration_number ? (
            <div className="mt-8 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-right">
              <p className="text-sm font-semibold text-emerald-900">تذكرة التسجيل</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{searchParams.registration_number}</p>
              <p className="mt-3 text-sm text-slate-700">يرجى تصوير هذه الشاشة أو حفظ رقم التسجيل للرجوع إليه لاحقاً.</p>
            </div>
          ) : null}
          <div className="mt-8 space-y-4">
            <Link href="/" className="inline-flex rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
              العودة إلى الصفحة الرئيسية
            </Link>
            <Link href="/competition" className="inline-flex rounded-full border border-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50">
              معرفة المزيد عن المسابقة
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
