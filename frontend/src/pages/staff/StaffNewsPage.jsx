import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  EyeOff,
  Search,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import StaffNewsDialog from "../../components/staff/news/StaffNewsDialog";
import { useStaffNews } from "../../hooks/useStaffNews";

const StaffNewsPage = () => {
  const {
    articles,
    loading,
    submitting,
    fetchArticles,
    submitArticle,
    deleteArticle,
  } = useStaffNews();

  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // Preview mode in Form modal
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setIsPublished(false);
    setThumbnailFile(null);
    setThumbnailPreview("");
    setEditingId(null);
    setPreviewMode(false);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (art) => {
    setTitle(art.title || "");
    setExcerpt(art.excerpt || "");
    setContent(art.content || "");
    setIsPublished(art.isPublished || false);
    setThumbnailFile(null);
    setThumbnailPreview(
      art.thumbnail ? `http://localhost:5000${art.thumbnail}` : "",
    );
    setEditingId(art.id);
    setPreviewMode(false);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File không được lớn hơn 5MB");
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung bài viết!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("excerpt", excerpt.trim());
    formData.append("content", content.trim());
    formData.append("isPublished", isPublished ? "true" : "false");
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    const success = await submitArticle(editingId, formData);
    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    await deleteArticle(id);
  };

  const filteredArticles = articles.filter(
    (art) =>
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white text-slate-900 font-sans p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <FileText className="text-primary-600" size={28} />
            <span>Quản Lý Tin Tức & Cẩm Nang</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Tạo mới, chỉnh sửa, và quản lý các bài viết trên hệ thống.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-slate-900 font-bold px-4 py- rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg border border-primary-600 transition-all shrink-0 align-self-start"
        >
          <Plus size={16} /> Viết Bài Mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex gap-4 items-center shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề hoặc tóm tắt bài viết..."
            className="w-full bg-white border border-slate-200 focus:border-primary-500 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all placeholder-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3" />
            <p className="text-xs text-slate-500 font-medium">
              Đang tải danh sách bài viết...
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 text-slate-500">
            <AlertCircle size={44} className="text-slate-600 mb-3" />
            <p className="text-sm font-bold">Không tìm thấy bài viết nào</p>
            <p className="text-xs text-slate-500 mt-1">
              Hãy thử tìm kiếm với từ khóa khác hoặc viết bài mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] bg-white/40">
                  <th className="px-3 py-2 ">Ảnh bìa</th>
                  <th className="px-3 py-2 ">Bài viết</th>
                  <th className="px-3 py-2  text-center">Trạng thái</th>
                  <th className="px-3 py-2  text-center">Xem</th>
                  <th className="px-3 py-2 ">Ngày tạo</th>
                  <th className="px-3 py-2  text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredArticles.map((art) => (
                  <tr
                    key={art.id}
                    className="hover:bg-white/20 transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="py-4 px-6 shrink-0">
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                        {art.thumbnail ? (
                          <img
                            src={`http://localhost:5000${art.thumbnail}`}
                            alt="thumb"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=150&auto=format&fit=crop";
                            }}
                          />
                        ) : (
                          <FileText size={16} className="text-slate-700" />
                        )}
                      </div>
                    </td>

                    {/* Title & Author */}
                    <td className="py-4 px-4 max-w-[280px]">
                      <div className="font-bold text-slate-800 line-clamp-1 hover:text-primary-600 transition-colors">
                        {art.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <span>Tác giả:</span>
                        <span className="font-bold text-slate-500">
                          {art.createdBy?.fullName || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Status Toggle Tag */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {art.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 border border-emerald-200 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <CheckCircle size={10} /> Đã Đăng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <EyeOff size={10} /> Bản Nháp
                        </span>
                      )}
                    </td>

                    {/* Views Count */}
                    <td className="py-4 px-4 text-center text-slate-700 font-semibold">
                      {art.views || 0}
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(art.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {art.isPublished && (
                          <a
                            href={`/news/${art.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
                            title="Xem trên trang chủ"
                          >
                            <Eye size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(art)}
                          className="p-1.5 bg-white hover:bg-slate-100 text-primary-600 hover:text-primary-600 rounded-lg transition-colors border border-slate-200"
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 bg-white hover:bg-red-50 text-slate-500 hover:text-primary-600 rounded-lg transition-colors border border-slate-200"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Write/Edit News Modal overlay */}
      <StaffNewsDialog
        isOpen={isModalOpen}
        editingId={editingId}
        title={title}
        setTitle={setTitle}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        content={content}
        setContent={setContent}
        isPublished={isPublished}
        setIsPublished={setIsPublished}
        thumbnailPreview={thumbnailPreview}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        submitting={submitting}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        onFileChange={handleFileChange}
      />
    </div>
  );
};

export default StaffNewsPage;
