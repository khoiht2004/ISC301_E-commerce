import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../services/axios";

const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [totalItems, setTotalItems] = useState(0);
  const limit = 6; // 6 items per page for clean grid

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/news", {
        params: {
          page: currentPage,
          limit,
          search: searchQuery,
        },
      });
      setNewsList(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
      // setTotalItems(res.data.pagination.total || 0);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNews();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 pb-20">
      {/* Banner/Header */}
      <div className="relative overflow-hidden bg-white border-b border-slate-100 py-16 mb-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(var(--color-brand-600)/0.05),transparent)]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="text-primary-600 font-bold tracking-widest text-xs uppercase bg-primary-50 border border-primary-100 px-4 py-1.5 rounded-full">
            Blog & Cẩm nang
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 mb-4 tracking-tight text-slate-900">
            Góc Tin Tức & <span className="text-primary-600">Ẩm Thực</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
            Cập nhật tin tức mới nhất về các loại thịt nhập khẩu cao cấp, công
            thức chế biến chuẩn nhà hàng và mẹo nội trợ hữu ích.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-md mx-auto relative flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-primary-700 hover:bg-primary-800 text-white font-bold px-6 rounded-xl text-sm transition-colors shadow-md shadow-primary-700/20"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {loading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-slate-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6 mb-4"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : newsList.length === 0 ? (
          // Empty state
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl max-w-xl mx-auto px-6 shadow-sm">
            <div className="w-16 h-16 bg-primary-50 border border-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">
              Không tìm thấy bài viết
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Chúng tôi không tìm thấy bài viết nào phù hợp với từ khóa của bạn.
              Vui lòng thử lại với từ khóa khác.
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                  setTimeout(fetchNews, 0);
                }}
                className="bg-primary-700 hover:bg-primary-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                Xem tất cả bài viết
              </button>
            )}
          </div>
        ) : (
          <>
            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsList.map((news) => (
                <article
                  key={news.id}
                  className="bg-white hover:shadow-xl rounded-2xl border border-slate-150 hover:border-slate-200 overflow-hidden flex flex-col transition-all duration-300 group shadow-sm"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/news/${news.slug}`}
                    className="block relative h-52 overflow-hidden bg-slate-100"
                  >
                    <img
                      src={
                        news.thumbnail
                          ? news.thumbnail.startsWith("http")
                            ? news.thumbnail
                            : `http://localhost:5000${news.thumbnail}`
                          : "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"
                      }
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop";
                      }}
                    />
                  </Link>

                  {/* Content Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary-600" />
                        {formatDate(news.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary-600" />
                        {news.createdBy?.fullName || "Tác giả"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
                      <Link
                        to={`/news/${news.slug}`}
                        className="no-underline text-slate-900 hover:text-primary-700"
                      >
                        {news.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                      {news.content
                        ? news.content
                            .replace(/<[^>]+>/g, "")
                            .substring(0, 150) + "..."
                        : "Không có tóm tắt."}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/news/${news.slug}`}
                        className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Đọc tiếp &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white border border-slate-200 p-2.5 rounded-xl transition-colors text-slate-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 font-bold text-sm rounded-xl border transition-colors ${
                      currentPage === i + 1
                        ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/30"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white border border-slate-200 p-2.5 rounded-xl transition-colors text-slate-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
