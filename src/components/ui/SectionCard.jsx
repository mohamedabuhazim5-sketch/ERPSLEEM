export default function SectionCard({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-sm backdrop-blur ${className}`.trim()}>
      {(title || subtitle || actions) ? (
        <div className="flex flex-col gap-3 border-b border-slate-100/80 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            {title ? <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}
