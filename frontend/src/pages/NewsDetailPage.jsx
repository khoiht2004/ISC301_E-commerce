import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Trash2,
  ArrowLeft,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/axios";

const NewsDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [myReaction, setMyReaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentText, setCommentText] = useState("");

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

  // Helper to render content with line breaks properly formatted as premium spacing
  const renderContent = (content) => {
    if (!content) return null;
    return content.split("\n").map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;
      // Basic markdown headers check
      if (trimmed.startsWith("###")) {
        return (
          <h4
            key={index}
            className="text-xl font-bold text-white mt-8 mb-4 border-l-4 border-primary-600 pl-3"
          >
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3
            key={index}
            className="text-2xl font-black text-white mt-10 mb-4 tracking-tight"
          >
            {trimmed.replace("##", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h2
            key={index}
            className="text-3xl font-black text-white mt-12 mb-6 tracking-tight"
          >
            {trimmed.replace("#", "").trim()}
          </h2>
        );
      }
      // Check for bullet list
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li
            key={index}
            className="text-slate-300 ml-6 list-disc mb-2 text-base md:text-lg leading-relaxed"
          >
            {trimmed.substring(1).trim()}
          </li>
        );
      }
      return (
        <p
          key={index}
          className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 font-normal"
        >
          {trimmed}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center py-20 pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mb-4"></div>
        <p className="text-slate-400 text-sm">Đang tải bài viết...</p>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-500 font-bold text-sm mb-8 no-underline transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách tin tức
        </Link>

        {/* Article Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 md:h-[420px] bg-slate-900 border border-slate-800/80 shadow-2xl">
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Header Info Overlaid on banner bottom for premium look */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10 bg-gradient-to-t from-slate-950 to-transparent">
            <span className="text-primary-500 font-extrabold tracking-widest text-[11px] uppercase bg-primary-950/70 border border-primary-900/60 px-3.5 py-1 rounded-full mb-3 inline-block">
              Premium Meat Knowledge
            </span>
            <h1 className="text-2xl md:text-4xl font-black mb-4 tracking-tight leading-tight text-white drop-shadow-md">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-800 border border-primary-700 flex items-center justify-center font-bold text-[10px] text-white">
                  {article.createdBy?.fullName?.[0] || "A"}
                </div>
                <span className="font-bold text-slate-200">
                  {article.createdBy?.fullName || "Tác giả"}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-4 h-4 text-primary-600" />
                {formatDate(article.createdAt)}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Eye className="w-4 h-4 text-primary-600" />
                {article.views} lượt xem
              </span>
            </div>
          </div>
        </div>

        {/* Article Excerpt */}
        {article.excerpt && (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 border-l-4 border-l-red-700 italic text-slate-300 text-base md:text-lg mb-10 leading-relaxed">
            {article.excerpt}
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-invert max-w-none mb-16 text-slate-300 text-justify">
          {renderContent(article.content)}
        </div>

        {/* End of article */}
      </div>
    </div>
  );
};

export default NewsDetailPage;
