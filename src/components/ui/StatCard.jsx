export default function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-[26px] border border-white/80 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-sm ring-1 ring-slate-100/80">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</h3>
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
