const conditions = [
  "أن لا يتجاوز عمر المترشح السن المطلوبة لكل فئة.",
  "أن يكون المترشح مقيماً في مقاطعة تفرغ زينه أو يدرس بإحدى المحاظر في المقاطعة.",
];

export default function EligibilitySection() {
  return (
    <section id="eligibility" className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
      <div className="text-right">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-900/80">شروط المشاركة</p>
        <h2 className="mt-3 text-3xl font-semibold text-emerald-950">شروط المشاركة</h2>
        <div className="mt-6 space-y-4">
          {conditions.map((condition, index) => (
            <div key={condition} className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 text-right">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-950 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-slate-700">{condition}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
