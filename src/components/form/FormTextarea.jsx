export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  className = "",
  containerClassName = "",
  rows = 4,
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label ? <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label> : null}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-slate-400 ${className}`}
        {...props}
      />
    </div>
  );
}
