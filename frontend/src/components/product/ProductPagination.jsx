const ProductPagination = ({ pagination, setCurrentPage }) => {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={pagination.page === 1}
        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {[...Array(pagination.totalPages)].map((_, index) => {
        const pageNum = index + 1;
        return (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
              pagination.page === pageNum
                ? "bg-primary-600 text-white border border-primary-600 shadow-sm shadow-primary-600/10"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-350 hover:bg-slate-50"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() =>
          setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
        }
        disabled={pagination.page === pagination.totalPages}
        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </div>
  );
};

export default ProductPagination;
