import { useState, useEffect } from "react";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import { formatPrice } from "../../utils/helper";
import {
  Tag,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";

const StaffDiscountPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // id of product being processed

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products/discount-suggestions");
      setSuggestions(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách gợi ý giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleApplyDiscount = async (productId, salePrice) => {
    setProcessing(productId);
    try {
      await api.put(`/products/${productId}`, { salePrice });
      toast.success("Đã áp dụng giảm giá thành công");
      // Update local state to reflect change without refetching all
      setSuggestions((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, salePrice } : p)),
      );
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi áp dụng giảm giá");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50/50">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <Tag className="w-8 h-8 text-primary-600" />
          Gợi ý giảm giá tự động
        </h2>
        <p className="text-slate-500 mt-2 font-medium">
          Hệ thống tự động đề xuất mức giảm giá cho các sản phẩm thịt sắp hết
          hạn để đẩy nhanh tiêu thụ.
        </p>
      </div>

      {loading ? (
        <div className="text-center p-12 text-slate-500 font-medium animate-pulse">
          Đang tải dữ liệu...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Tuyệt vời!</h3>
          <p className="text-slate-500 mt-2">
            Hiện không có sản phẩm nào sắp hết hạn cần giảm giá.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {suggestions.map((product) => {
            const isDanger = product.daysLeft <= 3;
            const hasApplied = product.salePrice === product.suggestedSalePrice;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div
                  className={`px-4 py-3 border-b ${isDanger ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"} flex justify-between items-start`}
                >
                  <div className="flex gap-3 items-center">
                    {isDanger ? (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-amber-600" />
                    )}
                    <div>
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${isDanger ? "text-red-700" : "text-amber-700"}`}
                      >
                        {isDanger ? "Rất cận date" : "Sắp cận date"}
                      </p>
                      <p
                        className={`text-sm font-semibold mt-0.5 ${isDanger ? "text-red-600" : "text-amber-600"}`}
                      >
                        Còn {product.daysLeft} ngày
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block mb-1">
                      Mức đề xuất
                    </span>
                    <span className="bg-white px-2 py-1 rounded-md text-sm font-black text-primary-600 border border-slate-200 shadow-sm">
                      Giảm {product.suggestedDiscountPercent}%
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="px-4 py-3 flex-1 flex flex-col">
                  <div className="flex gap-4 mb-4">
                    <img
                      src={
                        product.thumbnail ||
                        "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80"
                      }
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        Lô: {product.rawBatch?.batchCode}
                      </p>
                      <p className="text-xs text-slate-400">
                        Tồn kho:{" "}
                        <span className="font-bold text-slate-600">
                          {product.stock} {product.unit}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 mb-6 border border-slate-100 mt-auto">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-500">
                        Giá gốc:
                      </span>
                      <span className="text-sm font-semibold text-slate-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    {product.salePrice && !hasApplied && (
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-slate-500">
                          Đang khuyến mãi:
                        </span>
                        <span className="text-sm font-bold text-primary-500">
                          {formatPrice(product.salePrice)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                        Giá đề xuất:
                      </span>
                      <span className="text-lg font-black text-emerald-600">
                        {formatPrice(product.suggestedSalePrice)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {hasApplied ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Đã áp dụng
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleApplyDiscount(
                          product.id,
                          product.suggestedSalePrice,
                        )
                      }
                      disabled={processing === product.id}
                      className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
                    >
                      {processing === product.id
                        ? "Đang xử lý..."
                        : "Áp dụng mức giá này"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffDiscountPage;
