import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import RegistrationForm from "../../components/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(4,58,51,0.05)] sm:p-8 text-right">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-900/80">التسجيل</p>
          <h1 className="mt-3 text-3xl font-semibold text-emerald-950">النموذج الرسمي للتسجيل</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            هذا النموذج مخصص لتجهيز طلبات التسجيل في المسابقة. لا يتم الربط بخادم البيانات بعد.
          </p>
        </section>

        <div className="mt-8">
          <RegistrationForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
