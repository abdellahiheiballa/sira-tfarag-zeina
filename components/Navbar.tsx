"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "عن المسابقة", href: "/competition" },
  { label: "شروط المشاركة", href: "/competition#eligibility" },
  { label: "التسجيل", href: "/register" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-950 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-950/10">
            بلدية تفرغ زينه
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-700 rtl:space-x-reverse sm:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-emerald-900">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="hidden rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-950/10 transition hover:bg-emerald-800 sm:inline-flex"
          >
            سجّل الآن
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 sm:hidden"
            aria-label="فتح القائمة"
          >
            <span className="sr-only">فتح القائمة</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`${open ? "block" : "hidden"} border-t border-slate-200 bg-white/95 sm:hidden`}>
        <div className="space-y-1 px-4 py-4 text-right text-base font-medium text-slate-700">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-3 py-2 transition hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="block rounded-2xl bg-emerald-900 px-3 py-2 text-white transition hover:bg-emerald-800"
            onClick={() => setOpen(false)}
          >
            سجّل الآن
          </Link>
        </div>
      </div>
    </header>
  );
}
