interface CategoryCardProps {
  title: string;
  ageRange: string;
  description: string;
}

export default function CategoryCard({ title, ageRange, description }: CategoryCardProps) {
  return (
    <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-[0_18px_50px_rgba(4,58,51,0.06)]">
      <div className="flex items-center justify-between gap-4 text-right">
        <div>
          <p className="text-lg font-semibold text-emerald-950">{title}</p>
          <p className="mt-2 text-sm text-slate-600">{ageRange}</p>
        </div>
        <div className="rounded-2xl bg-emerald-950 px-4 py-2 text-sm font-semibold text-white">
          فئة رسمية
        </div>
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-700">{description}</p>
    </div>
  );
}
