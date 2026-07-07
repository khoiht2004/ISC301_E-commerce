import React from "react";

const StaffBatchDialog = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  products,
  suppliers,
  isEdit = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 shrink-0">
          <h3 className="text-xl font-bold text-slate-900">
            {isEdit ? "Cập nhật lô hàng" : "Nhập lô hàng mới"}
          </h3>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mã Lô Hàng *
            </label>
            <input
              required
              type="text"
              value={formData.batchCode}
              onChange={(e) =>
                setFormData({ ...formData, batchCode: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên nguyên liệu *
              </label>
              <input
                required
                type="text"
                placeholder="Nhập tên nguyên liệu..."
                value={formData.productName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhà cung cấp *
              </label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData({ ...formData, supplierId: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">Chọn nhà CC</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số lượng nhập (kg)*
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.importQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    importQuantity: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giá nhập (đơn vị) *
              </label>
              <input
                required
                type="number"
                min="0"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
          {isEdit && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số lượng tồn hiện tại (kg) *
              </label>
              <input
                required
                type="number"
                min="0"
                value={formData.currentQuantity ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentQuantity: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày SX
              </label>
              <input
                type="date"
                value={formData.manufactureDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    manufactureDate: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hạn sử dụng *
              </label>
              <input
                required
                type="date"
                value={formData.expirationDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expirationDate: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            className="px-5 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-md"
          >
            {isEdit ? "Cập nhật" : "Lưu lô hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffBatchDialog;
