export default function FormCheckbox({ label, name, checked, onChange, containerClassName = "" }) {
  return (
    <label className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 ${containerClassName}`}>
      <input type="checkbox" name={name} checked={Boolean(checked)} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
