import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white/90 px-6 py-10 shadow-[0_30px_80px_rgba(4,58,51,0.06)] sm:px-10 sm:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(217,249,157,0.18),_transparent_30%)]" />
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-emerald-100 opacity-80 blur-2xl" />
      <div className="absolute left-0 bottom-0 h-24 w-24 rounded-full bg-amber-100 opacity-80 blur-2xl" />
      <div className="relative space-y-6">
        <div className="max-w-2xl space-y-2 text-right">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-900/80">بلدية تفرغ زينه</p>
          <h1 className="text-4xl font-semibold leading-tight text-emerald-950 sm:text-5xl">
            المسابقة الثالثة في السيرة النبوية
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-700 sm:text-xl">
            «إحياءٌ للسيرة، وترسيخٌ للمحبة، واقتداءٌ بالنبي صلى الله عليه وسلم»
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 text-right">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">التسجيل مفتوح من</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-950">7 أغسطس إلى 14 أغسطس 2026</p>
          </div>
          <div className="flex flex-col gap-3 sm:justify-end">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              سجّل الآن
            </Link>
            <Link
              href="/competition#eligibility"
              className="inline-flex items-center justify-center rounded-full border border-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
            >
              شروط المسابقة
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
