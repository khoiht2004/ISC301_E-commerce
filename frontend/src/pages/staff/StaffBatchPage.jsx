import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, AlertTriangle, Search, Pencil, Trash2 } from "lucide-react";
import { formatDate, formatPrice } from "../../utils/helper";
import StaffBatchDialog from "../../components/staff/batch/StaffBatchDialog";
import { useStaffBatches } from "../../hooks/useStaffBatches";

const StaffBatchPage = () => {
  const {
    batches,
    suggestions,
    products,
    suppliers,
    loading,
    fetchBatches,
    fetchSuggestions,
    fetchDependencies,
    createBatch,
    updateBatch,
    deleteBatch,
  } = useStaffBatches();

  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'suggestions'
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    batchCode: "",
    importQuantity: "",
    costPrice: "",
    manufactureDate: "",
    expirationDate: "",
    productName: "",
    supplierId: "",
  });

  useEffect(() => {
    if (activeTab === "all") {
      fetchBatches(searchQuery);
    } else {
      fetchSuggestions();
    }
  }, [activeTab, searchQuery, fetchBatches, fetchSuggestions]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingBatch(null);
    setFormData({
      batchCode: "",
      importQuantity: "",
      costPrice: "",
      manufactureDate: "",
      expirationDate: "",
      productName: "",
      supplierId: "",
    });
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    if (formData.manufactureDate && formData.expirationDate) {
      const mDate = new Date(formData.manufactureDate);
      const eDate = new Date(formData.expirationDate);
      if (eDate <= mDate) {
        toast.error("Hạn sử dụng phải sau ngày sản xuất");
        return;
      }
    }

    let success = false;
    if (editingBatch) {
      success = await updateBatch(editingBatch.id, formData);
    } else {
      success = await createBatch(formData);
    }
    if (success) {
      handleCloseModal();
      fetchBatches(searchQuery);
    }
  };

  const handleEditClick = (batch) => {
    setEditingBatch(batch);
    setFormData({
      batchCode: batch.batchCode,
      importQuantity: batch.importQuantity,
      currentQuantity: batch.currentQuantity,
      costPrice: batch.costPrice,
      manufactureDate: batch.manufactureDate
        ? batch.manufactureDate.substring(0, 10)
        : "",
      expirationDate: batch.expirationDate
        ? batch.expirationDate.substring(0, 10)
        : "",
      productName: batch.rawMaterialName || batch.product?.name || "",
      supplierId: batch.supplierId,
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa lô hàng này? Tất cả các liên kết sản phẩm liên quan sẽ bị gỡ bỏ.",
      )
    ) {
      const success = await deleteBatch(id);
      if (success) {
        fetchBatches(searchQuery);
      }
    }
  };

  return (
    <div className="p-8 bg-slate-50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Quản Lý Lô Hàng
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý nhập hàng và theo dõi hạn sử dụng
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBatch(null);
            setFormData({
              batchCode: "",
              importQuantity: "",
              costPrice: "",
              manufactureDate: "",
              expirationDate: "",
              productName: "",
              supplierId: "",
            });
            setShowAddModal(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md shadow-primary-600/20"
        >
          <Plus size={16} /> Nhập lô mới
        </button>
      </div>

      <div className="flex gap-4 mb-6 shrink-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === "all"
              ? "bg-primary-100 text-primary-700 shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"
          }`}
        >
          Tất cả lô hàng
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "suggestions"
              ? "bg-amber-100 text-amber-700 shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm"
          }`}
        >
          <AlertTriangle size={16} /> Gợi ý giảm giá (sắp hết hạn)
        </button>
      </div>

      {activeTab === "all" && (
        <div className="mb-6 relative max-w-md shrink-0">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã lô, tên nguyên liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={16}
          />
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3" />
            <p className="text-xs text-slate-500 font-medium">Đang tải...</p>
          </div>
        </div>
      ) : activeTab === "all" ? (
        <div className="flex-1 overflow-auto bg-white border border-slate-200 rounded-2xl shadow-sm relative">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-6 py-4">Mã Lô</th>
                <th className="px-6 py-4">Nguyên Liệu</th>
                <th className="px-6 py-4">Tồn Kho</th>
                <th className="px-6 py-4">Giá Nhập</th>
                <th className="px-6 py-4">Hạn SD</th>
                <th className="px-6 py-4">Ngày SX</th>
                <th className="px-6 py-4">Ngày Nhập</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {batches.map((batch) => (
                <tr
                  key={batch.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {batch.batchCode}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">
                      {batch.rawMaterialName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        batch.currentQuantity === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {batch.currentQuantity} / {batch.importQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-primary-600">
                    {formatPrice(batch.costPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={
                        new Date(batch.expirationDate) < new Date()
                          ? "text-red-600 font-bold"
                          : ""
                      }
                    >
                      {formatDate(batch.expirationDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {batch.manufactureDate
                      ? formatDate(batch.manufactureDate)
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(batch.importDate)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(batch)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Sửa lô hàng"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(batch.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa lô hàng"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Không tìm thấy lô hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {suggestions.map((batch) => (
            <div
              key={batch.id}
              className="bg-white border border-amber-200 rounded-2xl px-3 py-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <h3
                  className="font-bold text-slate-900 line-clamp-1 mr-2"
                  title={batch.rawMaterialName}
                >
                  {batch.rawMaterialName}
                </h3>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-2 py-1 rounded shrink-0">
                  Sắp hết hạn
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                Mã lô:{" "}
                <strong className="text-slate-700">{batch.batchCode}</strong>
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Hạn SD:{" "}
                <strong className="text-red-600">
                  {formatDate(batch.expirationDate)}
                </strong>
              </p>

              <div className="bg-slate-50 rounded-lg p-3 text-xs mb-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tồn kho lô:</span>
                  <span className="font-bold">{batch.currentQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá nhập nguyên liệu:</span>
                  <span className="font-bold">
                    {formatPrice(batch.costPrice)}
                  </span>
                </div>
                {batch.processedProducts &&
                  batch.processedProducts.length > 0 && (
                    <div className="border-t border-slate-200/60 pt-1.5 mt-1.5">
                      <span className="text-slate-500 block mb-1">
                        Sản phẩm chế biến liên quan:
                      </span>
                      <div className="space-y-1">
                        {batch.processedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex justify-between text-[11px]"
                          >
                            <span
                              className="text-slate-700 truncate max-w-[130px]"
                              title={p.name}
                            >
                              • {p.name}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {formatPrice(p.salePrice || p.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <button className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-2 rounded-lg text-sm transition-colors">
                Đề xuất giảm giá
              </button>
            </div>
          ))}
          {suggestions.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              Không có lô hàng nào sắp hết hạn.
            </div>
          )}
        </div>
      )}

      <StaffBatchDialog
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateBatch}
        formData={formData}
        setFormData={setFormData}
        products={products}
        suppliers={suppliers}
        isEdit={!!editingBatch}
      />
    </div>
  );
};

export default StaffBatchPage;
