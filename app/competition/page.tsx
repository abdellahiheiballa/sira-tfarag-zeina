import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

export default function CompetitionPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
          <div className="text-right">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-900/80">عن المسابقة</p>
            <h1 className="mt-3 text-3xl font-semibold text-emerald-950">المسابقة الثالثة في السيرة النبوية</h1>
            <p className="mt-5 text-base leading-8 text-slate-700">
              بمناسبة اقتراب ذكرى المولد النبوي الشريف، وفي إطار الإحياءات المخلدة له، وحرصاً على ترسيخ محبته والاقتداء به صلى الله عليه وسلم، تعلن بلدية تفرغ زينه عن تنظيم النسخة الثالثة من مسابقة السيرة النبوية.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
            <h2 className="text-right text-2xl font-semibold text-emerald-950">فئات المسابقة</h2>
            <div className="mt-5 space-y-4 text-right">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5">
                <p className="text-lg font-semibold text-emerald-950">الأطفال</p>
                <p className="mt-2 text-sm text-slate-700">أقل من 12 سنة</p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-white p-5">
                <p className="text-lg font-semibold text-emerald-950">الكبار</p>
                <p className="mt-2 text-sm text-slate-700">من ١٢ سنه الي ٢٥ سنة</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-rose-700">الفئة العمرية تحت 12سنة أو من ١٢سنه الي ٢٥ سنة.</p>
          </div>
          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
            <h2 className="text-right text-2xl font-semibold text-emerald-950">شروط المشاركة</h2>
            <ol className="mt-5 space-y-3 text-right text-sm leading-7 text-slate-700">
              <li>1. أن لا يتجاوز عمر المترشح السن المطلوبة لكل فئة.</li>
              <li>2. أن يكون المترشح مقيماً في مقاطعة تفرغ زينه أو يدرس بإحدى المحاظر في المقاطعة.</li>
            </ol>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
          <div className="text-right">
            <h2 className="text-2xl font-semibold text-emerald-950">مستندات الترشح</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
              <li>• صورة من بطاقة التعريف الوطنية</li>
              <li>• شهادة إقامة أو إفادة محظرية</li>
            </ul>
            <p className="mt-4 text-sm text-slate-600">ستُطلب هذه الوثائق أثناء التسجيل الإلكتروني، فقط أنشأنا الواجهة في هذه المرحلة.</p>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-amber-100 bg-amber-50/90 p-6 shadow-[0_18px_50px_rgba(234,179,8,0.12)] sm:p-8">
          <div className="text-right">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700/90">فترة التسجيل</p>
            <p className="mt-3 text-2xl font-semibold text-amber-950">الجمعة 7 أغسطس 2026 إلى الجمعة 14 أغسطس 2026</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
