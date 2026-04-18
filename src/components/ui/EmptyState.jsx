export default function EmptyState({ title = 'لا توجد بيانات بعد', description = 'ابدأ بالإضافة أو غيّر الفلاتر الحالية.' }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
