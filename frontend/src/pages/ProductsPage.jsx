import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/axios";
import { toast } from "react-hot-toast";
import ProductCard from "../components/product/ProductCard";
import ProductFilterSidebar from "../components/product/ProductFilterSidebar";
import ProductPagination from "../components/product/ProductPagination";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // State
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get("/tags");
        if (res.data?.success) {
          setTags(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        sortBy,
        sortOrder,
        isPublished: "true",
      };

      if (search.trim()) params.search = search.trim();
      if (selectedTag) params.tagSlug = selectedTag;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.get("/products", { params });
      if (res.data?.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedTag, sortBy, sortOrder, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setSelectedTag("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Add to cart handler
  const handleAddToCart = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCartId(productId);
    await addToCart(productId, 1, navigate);
    setAddingToCartId(null);
  };



  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Premium Header Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-16 md:py-24">
        {/* Decorative background grid and shapes */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgb(var(--color-grid-line))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--color-grid-line))_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-primary-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-600 rounded-full blur-[100px] opacity-15 pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-3 py-1 bg-primary-600/20 border border-primary-500/30 text-primary-400 text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
            Deat Lemi Shop - Thịt Nhập Khẩu Cao Cấp
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Danh Sách Sản Phẩm
          </h1>
          <p className="text-slate-350 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Khám phá nguồn thực phẩm sạch, tươi ngon thượng hạng được nhập khẩu
            trực tiếp từ các nông trang danh tiếng toàn cầu.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* FILTER SIDEBAR */}
          <ProductFilterSidebar
            handleClearFilters={handleClearFilters}
            handleSearchSubmit={handleSearchSubmit}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            tags={tags}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            setCurrentPage={setCurrentPage}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          {/* PRODUCTS GRID SECTION */}
          <main className="w-full lg:w-3/4">
            {loading ? (
              /* Loading Skeletons */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse"
                  >
                    <div className="bg-slate-200 aspect-[4/3] w-full"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-slate-200 rounded-full w-2/3"></div>
                      <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                      <div className="h-3 bg-slate-200 rounded-full w-5/6"></div>
                      <div className="flex gap-2 pt-2">
                        <div className="h-5 bg-slate-200 rounded-full w-12"></div>
                        <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                        <div className="h-8 bg-slate-200 rounded-xl w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center max-w-xl mx-auto my-8">
                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-slate-500 mb-6 text-sm">
                  Chúng tôi không tìm thấy sản phẩm nào khớp với điều kiện lọc
                  của bạn. Thử thay đổi từ khóa hoặc bộ lọc xem sao!
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-750 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
                >
                  Xóa bộ lọc và làm mới
                </button>
              </div>
            ) : (
              /* Products list */
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      addingToCartId={addingToCartId}
                      handleAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                <ProductPagination
                  pagination={pagination}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
