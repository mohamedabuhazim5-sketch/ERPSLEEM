export default function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label ? <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label> : null}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-slate-400 ${className}`}
        {...props}
      />
    </div>
  );
}
