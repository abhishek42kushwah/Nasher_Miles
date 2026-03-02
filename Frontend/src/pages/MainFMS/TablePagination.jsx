const TablePagination = ({ page, setPage, total, limit }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (page <= 3) endPage = Math.min(totalPages, maxVisible);
    if (page > totalPages - 3)
      startPage = Math.max(1, totalPages - maxVisible + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-bg-card border border-border-main rounded-xl p-4 shadow-sm">
      {/* Left Info */}
      <p className="text-sm text-text-muted">
        Showing{" "}
        <span className="font-bold text-text-main">
          {start}-{end}
        </span>{" "}
        of <span className="font-bold text-text-main">{total}</span>
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 rounded-lg border border-border-main text-sm font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-bg-main transition-all"
        >
          Prev
        </button>

        {/* Page Numbers */}
        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all
              ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-border-main hover:bg-bg-main"
              }`}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-2 rounded-lg border border-border-main text-sm font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-bg-main transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
