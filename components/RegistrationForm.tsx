"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type EligibilityType = "resident" | "student";

type FormState = {
  fullName: string;
  birthDate: string;
  gender: string;
  phone: string;
  nationalId: string;
  address: string;
  eligibilityType: EligibilityType;
  muhadaraName: string;
  idCopy: File | null;
  residenceProof: File | null;
};

type FormErrors = Partial<Record<keyof FormState, string>> & {
  age?: string;
};

function calculateAge(birthDate: string) {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
}

function getAgeCategory(age: number | null) {
  if (age === null) return "";
  if (age < 0) return "تاريخ ميلاد غير صالح";
  if (age < 12) return "الفئة تحت 12سنة";
  if (age >= 12 && age <= 25) return "الفئة من ١٢سنه الي ٢٥ سنة";
  return "غير مشمول بالفئات المعلنة";
}

export default function RegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    birthDate: "",
    gender: "",
    phone: "",
    nationalId: "",
    address: "",
    eligibilityType: "resident",
    muhadaraName: "",
    idCopy: null,
    residenceProof: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const age = useMemo(() => calculateAge(form.birthDate), [form.birthDate]);
  const category = useMemo(() => getAgeCategory(age), [age]);

  const handleChange = (field: keyof FormState, value: string | File | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, age: undefined }));
    setApiError(null);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "يرجى إدخال الاسم الكامل";
    if (!form.birthDate) nextErrors.birthDate = "يرجى إدخال تاريخ الميلاد";
    if (!form.gender) nextErrors.gender = "يرجى اختيار الجنس";
    if (!form.phone.trim()) nextErrors.phone = "يرجى إدخال رقم الهاتف";
    if (!form.nationalId.trim()) nextErrors.nationalId = "يرجى إدخال رقم بطاقة التعريف الوطنية";
    if (!form.address.trim()) nextErrors.address = "يرجى إدخال العنوان";
    if (!form.eligibilityType) nextErrors.eligibilityType = "يرجى اختيار نوع الأهلية";
    if (form.eligibilityType === "student" && !form.muhadaraName.trim()) {
      nextErrors.muhadaraName = "يرجى إدخال اسم المحظرة";
    }
    if (!form.idCopy) nextErrors.idCopy = "يرجى إرفاق صورة بطاقة التعريف";
    if (!form.residenceProof) nextErrors.residenceProof = "يرجى إرفاق شهادة الإقامة أو الإفادة المحظرية";

    if (age === null) {
      nextErrors.age = "يرجى إدخال تاريخ ميلاد صالح";
    } else if (age < 0) {
      nextErrors.age = "تاريخ الميلاد غير صالح";
    } else if (age > 25) {
      nextErrors.age = "الفئة العمرية أكبر من 25 سنة غير مشمولة بالمشاركة";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setApiError(null);

    if (!validate()) return;

    const formData = new FormData();
    formData.append("full_name", form.fullName.trim());
    formData.append("date_of_birth", form.birthDate);
    formData.append("gender", form.gender);
    formData.append("phone", form.phone.trim());
    formData.append("national_id", form.nationalId.trim());
    formData.append("address", form.address.trim());
    formData.append("eligibility_type", form.eligibilityType === "resident" ? "resident" : "mahdara_student");
    if (form.eligibilityType === "student") {
      formData.append("mahdara_name", form.muhadaraName.trim());
    }
    if (form.idCopy) {
      formData.append("national_id_file", form.idCopy);
    }
    if (form.residenceProof) {
      formData.append("residence_document", form.residenceProof);
    }

    setLoading(true);
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        setApiError(result.error || "حدث خطأ أثناء إرسال الطلب.");
        setLoading(false);
        return;
      }

      router.push("/success");
    } catch {
      setApiError("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-emerald-950">1. المعلومات الشخصية</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">يرجى إدخال البيانات الشخصية كما هو وارد في بطاقة التعريف الوطنية.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 text-right">
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">الاسم الكامل</label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(event) => handleChange("fullName", event.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-right text-sm outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-100"
              />
              {errors.fullName ? <p className="text-sm text-rose-600">{errors.fullName}</p> : null}
            </div>
            <div className="space-y-2 text-right">
              <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700">تاريخ الميلاد</label>
              <input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(event) => handleChange("birthDate", event.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-right text-sm outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-100"
              />
              {errors.birthDate ? <p className="text-sm text-rose-600">{errors.birthDate}</p> : null}
              {age !== null ? <p className="text-sm text-slate-600">الفئة المتوقعة: {category}</p> : null}
              {submitted && errors.age ? <p className="text-sm text-rose-600">{errors.age}</p> : null}
            </div>
            <div className="space-y-2 text-right">
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700">الجنس</label>
              <select
                id="gender"
                value={form.gender}
                onChange={(event) => handleChange("gender", event.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-right text-sm outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">اختر</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              {errors.gender ? <p className="text-sm text-rose-600">{errors.gender}</p> : null}
            </div>
            <div className="space-y-2 text-right">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">رقم الهاتف</label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-right text-sm outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-100"
              />
              {errors.phone ? <p className="text-sm text-rose-600">{errors.phone}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-emerald-950">2. معلومات التواصل</h2>
          <div className="mt-6 grid gap-5">
            <div className="space-y-2 text-right">
              <label htmlFor="nationalId" className="block text-sm font-medium text-slate-700">رقم بطاقة التعريف الوطنية</label>
              <input
                id="nationalId"
                value={form.nationalId}
                onChange={(event) => handleChange("nationalId", event.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-right text-sm outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-100"
              />
              {errors.nationalId ? <p className="text-sm text-rose-600">{errors.nationalId}</p> : null}
            </div>
            <div className="space-y-2 text-right">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">العنوان</label>
              <textarea
                id="address"
                value={form.address}
                onChange={(event) => handleChange("address", event.target.value)}
                rows={3}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-right text-sm outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-100"
              />
              {errors.address ? <p className="text-sm text-rose-600">{errors.address}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-emerald-950">3. الأهلية للمشاركة</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">الرجاء اختيار الوضع الذي يحدد مدى أهليتك للمشاركة.</p>
          <div className="mt-6 space-y-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-right transition hover:border-emerald-900">
              <input
                type="radio"
                name="eligibility"
                value="resident"
                checked={form.eligibilityType === "resident"}
                onChange={() => handleChange("eligibilityType", "resident")}
                className="h-5 w-5 text-emerald-900 focus:ring-emerald-300"
              />
              <span className="text-sm font-medium text-slate-700">مقيم في مقاطعة تفرغ زينه</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-right transition hover:border-emerald-900">
              <input
                type="radio"
                name="eligibility"
                value="student"
                checked={form.eligibilityType === "student"}
                onChange={() => handleChange("eligibilityType", "student")}
                className="h-5 w-5 text-emerald-900 focus:ring-emerald-300"
              />
              <span className="text-sm font-medium text-slate-700">يدرس في محظرة بالمقاطعة</span>
            </label>
            {errors.eligibilityType ? <p className="text-sm text-rose-600">{errors.eligibilityType}</p> : null}
          </div>
          {form.eligibilityType === "student" ? (
            <div className="mt-6 text-right">
              <label htmlFor="muhadaraName" className="block text-sm font-medium text-slate-700">اسم المحظرة</label>
              <input
                id="muhadaraName"
                value={form.muhadaraName}
                onChange={(event) => handleChange("muhadaraName", event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-right text-sm outline-none transition focus:border-emerald-900 focus:ring-2 focus:ring-emerald-100"
              />
              {errors.muhadaraName ? <p className="text-sm text-rose-600">{errors.muhadaraName}</p> : null}
            </div>
          ) : null}
          <p className="mt-5 text-sm leading-7 text-rose-700">الفئة تحت 12سنة
            الفئة من ١٢سنه الي ٢٥ سنة</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-emerald-950">4. الوثائق المطلوبة</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">يرجى تجهيز الوثائق التالية. يمكنك اختيار الملف هنا، ولكن لن يتم رفعه فعلياً في هذه المرحلة.</p>
          <div className="mt-6 space-y-5">
            <div className="rounded-3xl border border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-800">صورة بطاقة التعريف</p>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(event) => handleChange("idCopy", event.target.files?.[0] ?? null)}
                className="mt-3 block w-full text-right text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-950 file:px-4 file:py-2 file:text-sm file:text-white"
              />
              {form.idCopy ? <p className="mt-2 text-sm text-slate-600">ملف محدد: {form.idCopy.name}</p> : <p className="mt-2 text-sm text-slate-500">لم يتم تحديد ملف بعد</p>}
              {errors.idCopy ? <p className="mt-2 text-sm text-rose-600">{errors.idCopy}</p> : null}
            </div>
            <div className="rounded-3xl border border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-800">شهادة إقامة أو إفادة محظرية</p>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(event) => handleChange("residenceProof", event.target.files?.[0] ?? null)}
                className="mt-3 block w-full text-right text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-950 file:px-4 file:py-2 file:text-sm file:text-white"
              />
              {form.residenceProof ? <p className="mt-2 text-sm text-slate-600">ملف محدد: {form.residenceProof.name}</p> : <p className="mt-2 text-sm text-slate-500">لم يتم تحديد ملف بعد</p>}
              {errors.residenceProof ? <p className="mt-2 text-sm text-rose-600">{errors.residenceProof}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8">
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-emerald-950">5. مراجعة الطلب</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">تأكد من صحة المعلومات قبل الإرسال.</p>
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
            <p>يرجى التأكد من صحة جميع الحقول، خاصة رقم الهاتف ورقم بطاقة التعريف والمنطقة.</p>
            <p className="mt-3 text-rose-700">بملاحظة أن التسجيل الفعلي غير مرتبط بخادم بعد.</p>
          </div>
          {apiError ? <p className="text-sm text-rose-600">{apiError}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "جارٍ الإرسال..." : "إرسال الطلب"}
          </button>
        </div>
      </section>
    </form>
  );
}
