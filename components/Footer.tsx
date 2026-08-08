import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-emerald-950/5 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 text-slate-700 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-emerald-950">بلدية تفرغ زينه</p>
            <p className="text-sm text-slate-600">المسابقة الثالثة في السيرة النبوية</p>
            <p className="text-sm text-slate-600">التسجيل: 7 أغسطس – 14 أغسطس 2026</p>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="font-semibold text-emerald-950">للاستفسار:</p>
            <Link href="tel:36257018" className="text-emerald-900 hover:underline">
              36257018
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
