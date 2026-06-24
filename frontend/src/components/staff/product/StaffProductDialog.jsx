import { Save, Upload, X } from "lucide-react";

const StaffProductDialog = ({
  isOpen,
  editingId,
  form,
  tags,
  newTagName,
  creatingTag,
  submitting,
  onClose,
  onSubmit,
  onFieldChange,
  onThumbnailChange,
  onImagesChange,
  onRemoveImagePreview,
  onToggleTag,
  onNewTagNameChange,
  onCreateTag,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <div>
            <h3 className="font-extrabold text-base text-slate-100">
              {editingId
                ? "Chỉnh sửa thông tin sản phẩm"
                : "Thêm sản phẩm mới"}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Cập nhật mô tả, giá nhập/bán, phân loại và bộ sưu tập hình ảnh
              sản phẩm.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
          <form id="productForm" onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-primary-650 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-200"
                  value={form.name}
                  onChange={(event) => onFieldChange("name", event.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Mã sản phẩm (SKU)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: BO-BACHI-01"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-primary-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-200 font-mono"
                  value={form.sku}
                  onChange={(event) => onFieldChange("sku", event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Đơn giá gốc (VND) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Nhập giá gốc..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-primary-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-200"
                  value={form.price}
                  onChange={(event) =>
                    onFieldChange("price", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Giá khuyến mãi (VND)
                </label>
                <input
                  type="number"
                  placeholder="Bỏ trống nếu không giảm giá..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-primary-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-200"
                  value={form.salePrice}
                  onChange={(event) =>
                    onFieldChange("salePrice", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Số lượng tồn kho *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-primary-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-200"
                  value={form.stock}
                  onChange={(event) =>
                    onFieldChange("stock", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Ảnh đại diện
                </label>
                <div className="relative group rounded-xl border border-dashed border-slate-800 hover:border-primary-800 bg-slate-950 flex flex-col items-center justify-center p-4 text-center cursor-pointer h-[120px] overflow-hidden transition-all">
                  {form.thumbnailPreview ? (
                    <>
                      <img
                        src={form.thumbnailPreview}
                        alt="Ảnh đại diện sản phẩm"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                        <Upload className="w-5 h-5 text-slate-200 mb-1" />
                        <span className="text-[10px] text-slate-350 font-bold">
                          Thay thế ảnh
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-650 mb-2 group-hover:text-primary-500" />
                      <span className="text-[10px] text-slate-400 font-bold">
                        Chọn ảnh đại diện sản phẩm
                      </span>
                      <span className="text-[9px] text-slate-500 mt-0.5">
                        Tải lên file PNG, JPG dưới 5MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={onThumbnailChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Album ảnh phụ
                </label>
                <div className="relative group rounded-xl border border-dashed border-slate-800 hover:border-primary-800 bg-slate-950 flex flex-col items-center justify-center p-4 text-center cursor-pointer h-[120px] overflow-hidden transition-all">
                  <Upload className="w-5 h-5 text-slate-650 mb-2 group-hover:text-primary-500" />
                  <span className="text-[10px] text-slate-400 font-bold">
                    Chọn nhiều ảnh phụ
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5">
                    Tối đa 8 ảnh, mỗi ảnh dưới 5MB
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={onImagesChange}
                  />
                </div>
              </div>
            </div>

            {form.imagePreviews.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Danh sách ảnh phụ hiện có ({form.imagePreviews.length})
                </label>
                <div className="flex flex-wrap gap-3">
                  {form.imagePreviews.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-850 bg-slate-950 group"
                    >
                      <img
                        src={image}
                        alt={`Ảnh phụ ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImagePreview(index)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-primary-650 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa ảnh"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-800/80 pt-5">
              <div className="flex flex-col sm:flex-row gap-6 justify-between">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-2.5 uppercase tracking-wider">
                    Chọn nhãn sản phẩm
                  </label>
                  {tags.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      Chưa có nhãn nào trên hệ thống. Hãy tạo nhãn đầu tiên ở ô
                      bên phải.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const isSelected = form.selectedTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => onToggleTag(tag.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                              isSelected
                                ? "bg-primary-950/60 border-primary-600 text-primary-400 font-extrabold"
                                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-64 bg-slate-900 border border-slate-850 rounded-xl p-3">
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Tạo nhãn mới
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tên nhãn..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary-600 text-slate-250"
                      value={newTagName}
                      onChange={(event) =>
                        onNewTagNameChange(event.target.value)
                      }
                    />
                    <button
                      type="button"
                      disabled={creatingTag || !newTagName.trim()}
                      onClick={onCreateTag}
                      className="bg-primary-800 hover:bg-primary-750 disabled:opacity-50 text-white p-2 rounded-lg text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Mô tả ngắn
              </label>
              <textarea
                rows="2"
                placeholder="Mô tả tóm tắt hiển thị ở thẻ danh sách sản phẩm..."
                className="w-full bg-slate-950 border border-slate-855 focus:border-primary-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-200 resize-none"
                value={form.shortDescription}
                onChange={(event) =>
                  onFieldChange("shortDescription", event.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Mô tả chi tiết sản phẩm
              </label>
              <textarea
                rows="6"
                placeholder="Chi tiết về nguồn gốc, hạn sử dụng, hướng dẫn chế biến, bảo quản..."
                className="w-full bg-slate-950 border border-slate-855 focus:border-primary-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-200 resize-y"
                value={form.description}
                onChange={(event) =>
                  onFieldChange("description", event.target.value)
                }
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="publishCheck"
                className="w-4.5 h-4.5 bg-slate-955 border border-slate-800 rounded focus:ring-primary-650 text-primary-700 cursor-pointer"
                checked={form.isPublished}
                onChange={(event) =>
                  onFieldChange("isPublished", event.target.checked)
                }
              />
              <label
                htmlFor="publishCheck"
                className="text-xs font-bold text-slate-350 cursor-pointer select-none"
              >
                Công khai bán sản phẩm ngay sau khi tạo hoặc lưu
              </label>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-750"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            form="productForm"
            disabled={submitting}
            className="px-5 py-2 bg-primary-800 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-primary-950/40"
          >
            <Save size={14} />
            {submitting
              ? "Đang lưu..."
              : editingId
                ? "Cập nhật sản phẩm"
                : "Đăng sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffProductDialog;
