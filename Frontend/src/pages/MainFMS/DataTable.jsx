const DataTable = ({ columns, data, sortConfig, onSort }) => {
  const sortIcon = (key) => {
    if (sortConfig?.key !== key)
      return <span className="text-slate-400 text-[10px] ml-1">↕</span>;

    return sortConfig.direction === "asc" ? (
      <span className="text-primary text-[10px] ml-1">↑</span>
    ) : (
      <span className="text-primary text-[10px] ml-1">↓</span>
    );
  };

  return (
    <div className="bg-bg-card mt-6 border border-border-main rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[900px] text-sm border-collapse">
          {/* ---------- HEADER ---------- */}
          <thead>
            <tr className="bg-bg-main/50 text-text-muted text-[10px] uppercase tracking-wider border-b border-border-main">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSort && onSort(col.key)}
                  className={`px-5 py-4 text-left select-none
                    ${onSort ? "cursor-pointer hover:bg-bg-main" : ""}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {onSort && sortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* ---------- BODY ---------- */}
          <tbody className="divide-y divide-border-main">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-20 text-text-muted font-bold"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-bg-main/20 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      {row[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
