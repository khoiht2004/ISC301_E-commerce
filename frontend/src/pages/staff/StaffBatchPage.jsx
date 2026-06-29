import { useState, useEffect } from "react";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import { Plus, AlertTriangle, Search } from "lucide-react";
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
  } = useStaffBatches();

  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'suggestions'
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    batchCode: "",
    importQuantity: "",
    costPrice: "",
    manufactureDate: "",
    expirationDate: "",
    productId: "",
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

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const success = await createBatch(formData);
    if (success) {
      setShowAddModal(false);
      setFormData({
        batchCode: "",
        importQuantity: "",
        costPrice: "",
        manufactureDate: "",
        expirationDate: "",
        productId: "",
        supplierId: "",
      });
      fetchBatches(searchQuery);
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
          onClick={() => setShowAddModal(true)}
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
            placeholder="Tìm kiếm theo mã lô, tên sản phẩm..."
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
                <th className="px-6 py-4">Sản Phẩm</th>
                <th className="px-6 py-4">Tồn Kho</th>
                <th className="px-6 py-4">Giá Nhập</th>
                <th className="px-6 py-4">Hạn SD</th>
                <th className="px-6 py-4">Ngày SX</th>
                <th className="px-6 py-4">Ngày Nhập</th>
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
                      {batch.product?.name}
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
                    {batch.manufactureDate ? formatDate(batch.manufactureDate) : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(batch.importDate)}
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
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
              className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 line-clamp-1 mr-2">
                  {batch.product?.name}
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

              <div className="bg-slate-50 rounded-lg p-3 text-xs mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Tồn kho lô:</span>
                  <span className="font-bold">{batch.currentQuantity}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Giá nhập:</span>
                  <span className="font-bold">
                    {formatPrice(batch.costPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá bán hiện tại:</span>
                  <span className="font-bold">
                    {formatPrice(
                      batch.product?.salePrice || batch.product?.price,
                    )}
                  </span>
                </div>
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
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateBatch}
        formData={formData}
        setFormData={setFormData}
        products={products}
        suppliers={suppliers}
      />
    </div>
  );
};

export default StaffBatchPage;
