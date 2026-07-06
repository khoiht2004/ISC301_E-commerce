import { X, Save, Upload } from "lucide-react";

const StaffNewsDialog = ({
  isOpen,
  editingId,
  title,
  setTitle,
  excerpt,
  setExcerpt,
  content,
  setContent,
  isPublished,
  setIsPublished,
  thumbnailPreview,
  previewMode,
  setPreviewMode,
  submitting,
  onClose,
  onSubmit,
  onFileChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="py-3 px-6 border-b border-slate-200 flex justify-between items-center bg-white/40">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              {editingId ? "Chỉnh Sửa Bài Viết" : "Viết Bài Mới"}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {editingId
                ? "Thay đổi nội dung thông tin bài viết"
                : "Đăng tải các kiến thức hoặc công thức ẩm thực"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode toggle */}
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                previewMode
                  ? "bg-slate-50 text-primary-600 border-primary-900/50"
                  : "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
              }`}
            >
              {previewMode ? "Sửa nội dung" : "Xem thử bài viết"}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-white/20">
          {previewMode ? (
            // Article Preview Mode
            <div className="max-w-2xl mx-auto py-4">
              {thumbnailPreview && (
                <div className="rounded-2xl overflow-hidden h-48 md:h-72 mb-6 border border-slate-200">
                  <img
                    src={thumbnailPreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-snug">
                {title || "Tiêu đề trống"}
              </h1>

              {excerpt && (
                <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-l-red-600 italic text-slate-500 text-sm mb-6">
                  {excerpt}
                </div>
              )}

              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line text-justify mt-6 border-t border-slate-200 pt-6">
                {content || "Nội dung bài viết chưa được nhập"}
              </div>
            </div>
          ) : (
            // Article Write Mode Form
            <form id="newsForm" onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Input details */}
                <div className="md:col-span-2 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Tiêu Đề Bài Viết *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập tiêu đề (ít nhất 5 ký tự)..."
                      className="w-full bg-white border border-slate-200 focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all text-slate-800"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Tóm Tắt Ngắn (Excerpt)
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Mô tả tóm tắt nội dung bài viết hiển thị ở thẻ tin tức..."
                      className="w-full bg-white border border-slate-200 focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all text-slate-800 resize-none"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </div>
                </div>

                {/* Right: Upload thumbnail */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Ảnh Đại Diện Bài Viết
                  </label>
                  <div className="relative group rounded-xl border border-dashed border-slate-200 hover:border-primary-800 bg-white flex flex-col items-center justify-center p-4 text-center cursor-pointer h-[130px] overflow-hidden transition-all">
                    {thumbnailPreview ? (
                      <>
                        <img
                          src={thumbnailPreview}
                          alt="upload"
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                          <Upload className="w-5 h-5 text-slate-800 mb-1" />
                          <span className="text-[10px] text-slate-700 font-bold">
                            Thay thế hình ảnh
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-600 mb-2 group-hover:text-primary-600 transition-colors" />
                        <span className="text-[10px] text-slate-500 font-bold">
                          Tải ảnh đại diện bài viết
                        </span>
                        <span className="text-[9px] text-slate-500 mt-1">
                          Hỗ trợ PNG, JPG (Max 5MB)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={onFileChange}
                    />
                  </div>
                </div>
              </div>

              {/* Content (Textarea Markdown/Text) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Nội Dung Chi Tiết *
                </label>
                <div className="bg-white rounded-xl border border-slate-200 focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600 transition-all p-1.5 flex flex-col">
                  {/* Quick hints */}
                  <div className="flex gap-4 p-1.5 text-[9px] text-slate-500 border-b border-slate-900 bg-white select-none">
                    <span>Định dạng hỗ trợ:</span>
                    <span>
                      <b># Tiêu đề 1</b>
                    </span>
                    <span>
                      <b>## Tiêu đề 2</b>
                    </span>
                    <span>
                      <b>- Danh sách</b>
                    </span>
                  </div>
                  <textarea
                    rows="12"
                    required
                    placeholder="Nội dung bài viết..."
                    className="w-full bg-transparent border-0 rounded-b-xl px-3 py-2 text-xs focus:outline-none transition-all text-slate-800 resize-y min-h-[220px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="publishCheck"
                  className="w-4.5 h-4.5 bg-white border border-slate-200 rounded focus:ring-primary-500 text-primary-700 cursor-pointer"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <label
                  htmlFor="publishCheck"
                  className="text-xs font-bold text-slate-700 cursor-pointer select-none"
                >
                  Công khai bài viết ngay sau khi lưu (Publish)
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="py-3 px-6 border-t border-slate-200 bg-white/40 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
          >
            Hủy bỏ
          </button>

          {!previewMode && (
            <button
              type="submit"
              form="newsForm"
              disabled={submitting}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-slate-900 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-lg "
            >
              <Save size={14} />
              {submitting
                ? "Đang lưu..."
                : editingId
                  ? "Cập nhật bài viết"
                  : "Đăng bài viết"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffNewsDialog;
