"use client";

export default function SaveTicketPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
    >
      حفظ التذكرة كملف PDF
    </button>
  );
}
