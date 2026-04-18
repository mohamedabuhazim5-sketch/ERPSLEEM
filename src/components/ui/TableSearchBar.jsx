export default function TableSearchBar({
  search,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions = [],
  placeholder = 'ابحث هنا...',
  actions = null,
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-md">
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </div>

          {filterOptions.length > 0 ? (
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white md:w-60"
            >
              <option value="">كل الحالات</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
