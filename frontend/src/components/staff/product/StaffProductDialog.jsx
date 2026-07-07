/* eslint-disable react/prop-types */
import { Save, Upload, X } from "lucide-react";

const StaffProductDialog = ({
  isOpen,
  editingId,
  form,
  tags,
  suppliers = [],
  batches = [],
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="py-2 px-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              {editingId ? "Chỉnh sửa thông tin sản phẩm" : "Thêm sản phẩm mới"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Cập nhật mô tả, giá nhập/bán, phân loại và bộ sưu tập hình ảnh sản
              phẩm.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <form id="productForm" onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-900 shadow-sm"
                  value={form.name}
                  onChange={(event) =>
                    onFieldChange("name", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Mã sản phẩm (SKU)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: BO-BACHI-01"
                  className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-900 font-mono shadow-sm"
                  value={form.sku}
                  onChange={(event) => onFieldChange("sku", event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Đơn giá gốc (VND) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Nhập giá gốc..."
                  className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-900 shadow-sm"
                  value={form.price}
                  onChange={(event) =>
                    onFieldChange("price", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Giá khuyến mãi (VND)
                </label>
                <input
                  type="number"
                  placeholder="Bỏ trống nếu không giảm giá..."
                  className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-900 shadow-sm"
                  value={form.salePrice}
                  onChange={(event) =>
                    onFieldChange("salePrice", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Số lượng tồn kho *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-900 shadow-sm"
                  value={form.stock}
                  onChange={(event) =>
                    onFieldChange("stock", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Lô nguyên liệu
                </label>
                <select
                  className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-900 shadow-sm"
                  value={form.rawBatchId}
                  onChange={(event) =>
                    onFieldChange("rawBatchId", event.target.value)
                  }
                >
                  <option value="">-- Không liên kết --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} - {b.rawMaterialName} (HSD: {new Date(b.expirationDate).toLocaleDateString('vi-VN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nhà cung cấp
                </label>
                {form.rawBatchId ? (
                  (() => {
                    const selectedBatch = batches.find((b) => b.id === parseInt(form.rawBatchId));
                    const supplierName = selectedBatch?.supplier?.name || "Đang tải nhà cung cấp...";
                    return (
                      <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-semibold shadow-sm h-[46px] flex items-center select-none">
                        {supplierName}
                      </div>
                    );
                  })()
                ) : (
                  <select
                    className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-900 shadow-sm"
                    value={form.supplierId}
                    onChange={(event) =>
                      onFieldChange("supplierId", event.target.value)
                    }
                  >
                    <option value="">-- Không chọn --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Ảnh đại diện
                </label>
                <div className="relative group rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-400 bg-white hover:bg-primary-50 flex flex-col items-center justify-center p-4 text-center cursor-pointer h-[140px] overflow-hidden transition-all shadow-sm">
                  {form.thumbnailPreview ? (
                    <>
                      <img
                        src={form.thumbnailPreview}
                        alt="Ảnh đại diện sản phẩm"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                        <Upload className="w-6 h-6 text-white mb-2" />
                        <span className="text-xs text-white font-bold">
                          Thay thế ảnh
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-primary-600 transition-colors" />
                      <span className="text-sm text-slate-700 font-bold mb-1">
                        Chọn ảnh đại diện sản phẩm
                      </span>
                      <span className="text-xs text-slate-500">
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Album ảnh phụ
                </label>
                <div className="relative group rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-400 bg-white hover:bg-primary-50 flex flex-col items-center justify-center p-4 text-center cursor-pointer h-[140px] overflow-hidden transition-all shadow-sm">
                  <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-primary-600 transition-colors" />
                  <span className="text-sm text-slate-700 font-bold mb-1">
                    Chọn nhiều ảnh phụ
                  </span>
                  <span className="text-xs text-slate-500">
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
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Danh sách ảnh phụ hiện có ({form.imagePreviews.length})
                </label>
                <div className="flex flex-wrap gap-3">
                  {form.imagePreviews.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-sm"
                    >
                      <img
                        src={image}
                        alt={`Ảnh phụ ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImagePreview(index)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-primary-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa ảnh"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-6 mt-6">
              <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wider">
                    Chọn nhãn sản phẩm
                  </label>
                  {tags.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
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
                            className={`px-4 py-1.5 rounded-xl text-sm font-bold border transition-all ${
                              isSelected
                                ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm shadow-primary-100"
                                : "bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600"
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm ">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Tạo nhãn mới
                  </label>
                  <div className="flex max-w-full gap-2">
                    <input
                      type="text"
                      placeholder="Tên nhãn..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 text-slate-900 transition-all shadow-sm"
                      value={newTagName}
                      onChange={(event) =>
                        onNewTagNameChange(event.target.value)
                      }
                    />
                    <button
                      type="button"
                      disabled={creatingTag || !newTagName.trim()}
                      onClick={onCreateTag}
                      className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Mô tả ngắn
              </label>
              <textarea
                rows="2"
                placeholder="Mô tả tóm tắt hiển thị ở thẻ danh sách sản phẩm..."
                className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-900 resize-none shadow-sm"
                value={form.shortDescription}
                onChange={(event) =>
                  onFieldChange("shortDescription", event.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Mô tả chi tiết sản phẩm
              </label>
              <textarea
                rows="6"
                placeholder="Chi tiết về nguồn gốc, hạn sử dụng, hướng dẫn chế biến, bảo quản..."
                className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-600 transition-all text-slate-900 resize-y shadow-sm"
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
                className="w-5 h-5 bg-white border border-slate-300 rounded focus:ring-primary-600 text-primary-600 cursor-pointer transition-all"
                checked={form.isPublished}
                onChange={(event) =>
                  onFieldChange("isPublished", event.target.checked)
                }
              />
              <label
                htmlFor="publishCheck"
                className="text-sm font-bold text-slate-700 cursor-pointer select-none"
              >
                Công khai bán sản phẩm ngay sau khi tạo hoặc lưu
              </label>
            </div>
          </form>
        </div>

        <div className="py-2 px-6  border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors border border-slate-200 shadow-sm"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            form="productForm"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-primary-600/30"
          >
            <Save size={18} />
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
