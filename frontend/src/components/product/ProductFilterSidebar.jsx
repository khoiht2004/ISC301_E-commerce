const ProductFilterSidebar = ({
  handleClearFilters,
  handleSearchSubmit,
  searchInput,
  setSearchInput,
  tags,
  selectedTag,
  setSelectedTag,
  setCurrentPage,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <aside className="w-full lg:w-1/4 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm sticky top-28">
        <div className="flex items-center justify-between mb-6 p-2 border-b border-slate-100">
          <h2 className="text-md font-bold text-slate-900 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-primary-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              />
            </svg>
            <span>Bộ lọc</span>
          </h2>
          <button
            onClick={handleClearFilters}
            className="text-[10px] font-semibold text-primary-600 uppercase border border-primary-600 px-2 py-1.5 rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
          >
            Xóa tất cả
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Tìm kiếm sản phẩm
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập tên, loại thịt..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                />
              </svg>
            </span>
          </div>
        </form>

        {/* Tag Selection Chips */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Nhóm sản phẩm
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedTag("");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedTag === ""
                  ? "bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-600/10"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-350 hover:bg-slate-50"
              }`}
            >
              Tất cả
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTag(tag.slug);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedTag === tag.slug
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-600/10"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-350 hover:bg-slate-50"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Khoảng giá (VND)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Từ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
            />
            <span className="text-slate-400 text-xs">─</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Đến"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
            />
          </div>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Sắp xếp theo
          </label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field);
              setSortOrder(order);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs cursor-pointer"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="stock-desc">Số lượng kho lớn</option>
          </select>
        </div>
      </div>
    </aside>
  );
};

export default ProductFilterSidebar;
