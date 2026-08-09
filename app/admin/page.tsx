"use client";

import { useCallback, useMemo, useState } from "react";

type SubmissionDocument = {
  participant_id: number;
  document_type: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  url?: string | null;
};

type Submission = {
  id: number;
  registration_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  national_id: string;
  address: string;
  eligibility_type: string;
  mahdara_name: string | null;
  category: string;
  status: string;
  documents: SubmissionDocument[];
};

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = useMemo(() => username === "admin" && password === "admin123", [username, password]);
  const childrenSubmissions = useMemo(() => submissions.filter((submission) => submission.category === "children"), [submissions]);
  const adultSubmissions = useMemo(() => submissions.filter((submission) => submission.category === "adults"), [submissions]);

  const fetchSubmissions = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "فشل تسجيل الدخول أو جلب البيانات.");
        setSubmissions([]);
        return;
      }

      setSubmissions(result.submissions ?? []);
    } catch (fetchError) {
      setError("خطأ في الاتصال، يرجى المحاولة مرة أخرى.");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [username, password]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold leading-tight">لوحة إدارة التسجيلات</h1>
        <p className="mt-2 text-sm text-slate-500">صفحة مخفية لعرض جميع التسجيلات بعد تسجيل الدخول.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold">تسجيل الدخول</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                fetchSubmissions();
              }}
              className="space-y-4"
            >
              <label className="block">
                <span className="text-sm font-medium text-slate-700">اسم المستخدم</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                  placeholder="admin"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">كلمة المرور</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                  placeholder="admin123"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "جاري التحميل..." : "عرض التسجيلات"}
              </button>
            </form>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <p className="mt-3 text-xs text-slate-500">ملاحظة: اسم المستخدم وكلمة المرور هما admin / admin123.</p>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold">حالة المصادقة</h2>
            <p className="text-sm text-slate-600">{isLoggedIn ? "مقبول: يمكنك الوصول إلى قائمة التسجيلات." : "مرفوض: يرجى إدخال بيانات الاعتماد الصحيحة."}</p>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-700">الوصول عبارة عن مصادقة بسيطة فقط على العميل. يتم التحقق من صحة البيانات على الخادم أيضًا.</p>
            </div>
          </div>
        </div>

        {submissions.length > 0 ? (
          <div className="mt-10 space-y-10">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-2xl font-semibold">الفئة تحت 12 سنة ({childrenSubmissions.length})</h2>
              <div className="mt-6 space-y-6">
                {childrenSubmissions.length > 0 ? (
                  childrenSubmissions.map((submission) => (
                    <div key={submission.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">رقم التسجيل</p>
                          <p className="text-lg font-semibold text-slate-900">{submission.registration_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">الاسم</p>
                          <p className="font-semibold text-slate-900">{submission.full_name}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">الهاتف</p>
                          <p className="mt-1 text-sm text-slate-900">{submission.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">الهوية</p>
                          <p className="mt-1 text-sm text-slate-900">{submission.national_id}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">الفئة</p>
                          <p className="mt-1 text-sm text-slate-900 capitalize">{submission.category}</p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-slate-700">
                        <p>نوع الأهلية: {submission.eligibility_type}</p>
                        {submission.mahdara_name ? <p>اسم المحظرة: {submission.mahdara_name}</p> : null}
                        <p>الحالة: {submission.status}</p>
                      </div>
                      {submission.documents.length > 0 ? (
                        <div className="mt-4 rounded-3xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-900">المستندات</p>
                          <ul className="mt-3 space-y-2 text-sm text-slate-700">
                            {submission.documents.map((document) => (
                              <li key={document.storage_path} className="rounded-2xl border border-slate-200 bg-white p-3">
                                <p className="font-medium text-slate-900">{document.document_type}</p>
                                <p className="text-xs text-slate-500">{document.original_filename}</p>
                                <p className="text-xs text-slate-500">{document.mime_type} · {document.file_size} بايت</p>
                                {document.url ? (
                                  <a
                                    href={document.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-block text-xs font-medium text-slate-900 underline"
                                  >
                                    افتح المستند
                                  </a>
                                ) : (
                                  <p className="mt-2 text-xs text-red-600">لا يمكن فتح هذا المستند حالياً.</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">لا توجد تسجيلات في هذه الفئة.</p>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-2xl font-semibold">الفئة من ١٢سنه الي ٢٥ سنة ({adultSubmissions.length})</h2>
              <div className="mt-6 space-y-6">
                {adultSubmissions.length > 0 ? (
                  adultSubmissions.map((submission) => (
                    <div key={submission.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">رقم التسجيل</p>
                          <p className="text-lg font-semibold text-slate-900">{submission.registration_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">الاسم</p>
                          <p className="font-semibold text-slate-900">{submission.full_name}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">الهاتف</p>
                          <p className="mt-1 text-sm text-slate-900">{submission.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">الهوية</p>
                          <p className="mt-1 text-sm text-slate-900">{submission.national_id}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">الفئة</p>
                          <p className="mt-1 text-sm text-slate-900 capitalize">{submission.category}</p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-slate-700">
                        <p>نوع الأهلية: {submission.eligibility_type}</p>
                        {submission.mahdara_name ? <p>اسم المحظرة: {submission.mahdara_name}</p> : null}
                        <p>الحالة: {submission.status}</p>
                      </div>
                      {submission.documents.length > 0 ? (
                        <div className="mt-4 rounded-3xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-900">المستندات</p>
                          <ul className="mt-3 space-y-2 text-sm text-slate-700">
                            {submission.documents.map((document) => (
                              <li key={document.storage_path} className="rounded-2xl border border-slate-200 bg-white p-3">
                                <p className="font-medium text-slate-900">{document.document_type}</p>
                                <p className="text-xs text-slate-500">{document.original_filename}</p>
                                <p className="text-xs text-slate-500">{document.mime_type} · {document.file_size} بايت</p>
                                {document.url ? (
                                  <a
                                    href={document.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-block text-xs font-medium text-slate-900 underline"
                                  >
                                    افتح المستند
                                  </a>
                                ) : (
                                  <p className="mt-2 text-xs text-red-600">لا يمكن فتح هذا المستند حالياً.</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">لا توجد تسجيلات في هذه الفئة.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
