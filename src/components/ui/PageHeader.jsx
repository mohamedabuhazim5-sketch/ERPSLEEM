export default function PageHeader({ title, subtitle, actions, eyebrow = 'Sleem ERP' }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="inline-flex rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 shadow-sm">
          {eyebrow}
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 md:justify-end">{actions}</div> : null}
    </div>
  );
}
