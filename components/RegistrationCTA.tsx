import Link from "next/link";

export default function RegistrationCTA() {
  return (
    <section className="rounded-[2rem] border border-amber-100 bg-amber-50/80 p-6 shadow-[0_18px_50px_rgba(234,179,8,0.12)] sm:p-8">
      <div className="flex flex-col gap-6 text-right sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700/90">فترة التسجيل</p>
          <p className="mt-3 text-2xl font-semibold text-amber-950">الجمعة 7 أغسطس 2026 إلى الجمعة 14 أغسطس 2026</p>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          سجّل الآن
        </Link>
      </div>
    </section>
  );
}
