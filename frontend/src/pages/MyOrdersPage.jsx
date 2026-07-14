import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../services/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/helper";
import { toast } from "react-hot-toast";
import OrderComplaintForm from "../components/order/OrderComplaintForm";

const MyOrdersPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [complaintOrder, setComplaintOrder] = useState(null);

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending_pickup", label: "Chờ lấy hàng" },
    { id: "shipping", label: "Chờ giao hàng" },
    { id: "delivered", label: "Đã giao" },
    { id: "returned", label: "Trả hàng" },
    { id: "cancelled", label: "Đã hủy" },
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 550);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 5,
        tab: activeTab !== "all" ? activeTab : undefined,
        search: debouncedSearch || undefined,
      };
      const { data } = await axios.get("/orders/my-orders", { params });
      setOrders(data.data);
      setPagination({
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, activeTab, currentPage, debouncedSearch]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      await axios.put(`/orders/${orderId}/cancel`);
      toast.success("Hủy đơn hàng thành công");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const handleBuyAgain = async (items) => {
    try {
      toast.loading("Đang thêm sản phẩm vào giỏ hàng...", { id: "buy-again" });
      for (const item of items) {
        await addToCart(item.productId, item.quantity);
      }
      toast.success("Đã thêm các sản phẩm vào giỏ hàng", { id: "buy-again" });
      navigate("/cart");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Không thể thêm một số sản phẩm vào giỏ hàng", { id: "buy-again" });
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">Chờ thanh toán</span>;
      case "PENDING_VALIDATION":
        return <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Đang xác thực</span>;
      case "INVALID_ADDRESS":
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Địa chỉ không hợp lệ</span>;
      case "PAYMENT_FAILED":
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Thanh toán thất bại</span>;
      case "OUT_OF_STOCK":
        return <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">Hết hàng (Chờ CSKH)</span>;
      case "CONFIRMED":
        return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Đang chuẩn bị</span>;
      case "PROCESSING":
        return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Đang xử lý</span>;
      case "SHIPPING":
        return <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">Đang giao hàng</span>;
      case "DELIVERED":
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Đã giao hàng</span>;
      case "COMPLETED":
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Đã hoàn thành</span>;
      case "CANCELLED":
        return <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-bold">Đã hủy</span>;
      case "RETURNED":
        return <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold">Trả hàng / Hoàn tiền</span>;
      case "RETURN_REQUESTED":
        return <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold">Đang yêu cầu trả hàng</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="text-amber-600 text-xs font-medium border border-amber-200 px-2 py-0.5 rounded">Chưa thanh toán</span>;
      case "PAID":
        return <span className="text-emerald-600 text-xs font-medium border border-emerald-200 px-2 py-0.5 rounded">Đã thanh toán</span>;
      case "FAILED":
        return <span className="text-red-500 text-xs font-medium border border-red-200 px-2 py-0.5 rounded">Lỗi thanh toán</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-8 tracking-tight">
          Đơn Hàng Của Tôi
        </h1>

        {/* TABS CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar scroll-smooth border-b border-slate-100">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 text-center py-4 px-6 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${isActive
                    ? "text-primary-600 border-primary-600 bg-primary-50/5"
                    : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50/50"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z"
            />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo Mã đơn hàng hoặc Tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-slate-700 bg-transparent border-none outline-none placeholder:text-slate-400 focus:ring-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Xóa
            </button>
          )}
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-slate-700 mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Có vẻ bạn chưa đặt đơn hàng nào hoặc không có đơn hàng nào khớp với tìm kiếm của bạn.
            </p>
            <Link
              to="/products"
              className="inline-block bg-primary-600 hover:bg-primary-750 text-white font-bold py-2.5 px-8 rounded-xl transition-colors shadow-sm"
            >
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header card */}
                <div className="bg-slate-50/70 border-b border-slate-100 p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Mã đơn hàng
                      </span>
                      <span className="font-extrabold text-slate-800 text-sm">
                        {order.orderCode}
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Ngày đặt
                      </span>
                      <span className="font-semibold text-slate-600 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}{" "}
                        {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getOrderStatusBadge(order.orderStatus)}
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>

                {/* Items detail */}
                <div className="p-4 md:px-6 divide-y divide-slate-50">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-2 last:pb-2">
                      <img
                        src={
                          item.productImage ||
                          "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
                        }
                        alt={item.productName}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-150 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-800 truncate">
                          {item.productName}
                        </h4>
                        <div className="text-xs text-slate-400 mt-1">
                          Số lượng: <span className="font-bold text-slate-700">x{item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Đơn giá: {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer card */}
                <div className="bg-slate-50/30 border-t border-slate-100 p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-500 font-medium">Tổng số tiền:</span>
                    <span className="text-lg font-extrabold text-primary-600">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Link
                      to={`/orders/${order.id}`}
                      className="bg-white border border-slate-350 text-slate-700 hover:border-primary-500 hover:text-primary-600 font-bold py-2 px-4 rounded-xl transition-colors text-xs shadow-sm"
                    >
                      Xem chi tiết
                    </Link>

                    {/* Cancel Action */}
                    {["PENDING", "PENDING_VALIDATION", "CONFIRMED", "PROCESSING", "OUT_OF_STOCK"].includes(
                      order.orderStatus
                    ) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl transition-colors text-xs"
                        >
                          Hủy đơn hàng
                        </button>
                      )}

                    {/* Complaint/Return Action */}
                    {["DELIVERED", "COMPLETED"].includes(order.orderStatus) && (
                      <button
                        onClick={() => setComplaintOrder(order)}
                        className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold py-2 px-4 rounded-xl transition-colors text-xs"
                      >
                        Trả hàng / Khiếu nại
                      </button>
                    )}

                    {/* Buy Again Action */}
                    {["DELIVERED", "COMPLETED", "CANCELLED", "RETURNED"].includes(order.orderStatus) && (
                      <button
                        onClick={() => handleBuyAgain(order.orderItems)}
                        className="bg-primary-600 hover:bg-primary-750 text-white font-bold py-2 px-4 rounded-xl transition-colors text-xs shadow-sm"
                      >
                        Mua lại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${pagination.page === pageNum
                        ? "bg-primary-600 text-white border border-primary-600 shadow-sm shadow-primary-600/10"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-350 hover:bg-slate-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {complaintOrder && (
        <OrderComplaintForm
          isOpen={!!complaintOrder}
          onClose={() => setComplaintOrder(null)}
          orderId={complaintOrder.id}
          orderCode={complaintOrder.orderCode}
          onSuccess={() => {
            setComplaintOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;
