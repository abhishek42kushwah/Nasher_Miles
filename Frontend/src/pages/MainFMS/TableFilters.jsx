import { useCallback } from "react";

const FILTERS = [
  { key: "firm", label: "Firm", icon: "business" },
  { key: "buyer", label: "Buyer", icon: "person" },
  { key: "item", label: "Item", icon: "inventory_2" },
  { key: "uid", label: "UID", icon: "badge" },
];

const DelegationFilters = ({ values, onChange }) => {
  const handleChange = useCallback(
    (key, value) => {
      onChange((prev) => ({ ...prev, [key]: value }));
    },
    [onChange],
  );

  const handleReset = () => {
    onChange({
      firm: "",
      buyer: "",
      item: "",
      uid: "",
    });
  };

  const hasFilters = Object.values(values).some(Boolean);

  return (
    <div className="bg-bg-card border border-border-main rounded-xl p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-main uppercase tracking-wide">
          Filters
        </h3>

        {hasFilters && (
          <button
            onClick={handleReset}
            className="text-xs font-bold text-red-500 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {FILTERS.map(({ key, label, icon }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-text-muted px-1">
              {label}
            </label>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-muted">
                {icon}
              </span>

              <input
                type="text"
                value={values[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`Search ${label}`}
                className="w-full bg-bg-main border border-border-main rounded-xl
                           pl-10 pr-3 py-2 text-sm
                           focus:ring-2 focus:ring-primary/20 outline-none
                           transition-all"
              />

              {values[key] && (
                <button
                  type="button"
                  onClick={() => handleChange(key, "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-red-500"
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DelegationFilters;
