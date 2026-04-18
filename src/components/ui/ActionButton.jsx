export default function ActionButton({
  children,
  type = "button",
  onClick,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  className = "",
}) {
  const variants = {
    primary: 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm',
    secondary: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 shadow-sm',
    ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    success:
    'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? 'w-full' : ''} ${variants[variant] || variants.primary} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
