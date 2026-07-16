import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/axios";

const NewsDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchArticleAndComments = async () => {
    setLoading(true);
    try {
      // Get article details
      const artRes = await api.get(`/news/${slug}`);
      const artData = artRes.data.data;
      setArticle(artData);
    } catch (err) {
      console.error("Failed to fetch article details:", err);
      toast.error("Không tìm thấy bài viết hoặc bài viết chưa được công bố");
      navigate("/news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleAndComments();
  }, [slug, user]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center py-20 pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mb-4"></div>
        <p className="text-slate-500 text-sm">Đang tải bài viết...</p>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-20 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold text-sm mb-8 no-underline transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách tin tức
        </Link>

        {/* Article Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 md:h-[420px] bg-white border border-slate-200 shadow-xl">
          <img
            src={
              article.thumbnail
                ? article.thumbnail.startsWith("http")
                  ? article.thumbnail
                  : `http://localhost:5000${article.thumbnail}`
                : "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop"
            }
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

          {/* Header Info Overlaid on banner bottom for premium look */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10 bg-gradient-to-t from-slate-900 to-transparent">
            <span className="text-primary-500 font-extrabold tracking-widest text-[11px] uppercase bg-white/90 border border-white/60 px-3.5 py-1 rounded-full mb-3 inline-block">
              Premium Meat Knowledge
            </span>
            <h1 className="text-2xl md:text-4xl font-black mb-4 tracking-tight leading-tight text-white drop-shadow-md">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-600 border border-primary-500 flex items-center justify-center font-bold text-[10px] text-white">
                  {article.createdBy?.fullName?.[0] || "A"}
                </div>
                <span className="font-bold text-white">
                  {article.createdBy?.fullName || "Tác giả"}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-4 h-4 text-primary-400" />
                {formatDate(article.createdAt)}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Eye className="w-4 h-4 text-primary-400" />
                {article.views} lượt xem
              </span>
            </div>
          </div>
        </div>

        {/* Article Excerpt */}
        {article.excerpt && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-primary-600 italic text-slate-600 text-base md:text-lg mb-10 leading-relaxed shadow-sm">
            {article.excerpt}
          </div>
        )}

        {/* Article Content */}
        <div
          className="prose max-w-none mb-16 text-slate-700 text-justify"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* End of article */}
      </div>
    </div>
  );
};

export default NewsDetailPage;
