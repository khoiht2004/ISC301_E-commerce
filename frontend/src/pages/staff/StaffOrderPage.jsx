import { useState, useEffect } from "react";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import { getSocket } from "../../services/socketService";

const StaffOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/staff/orders"); // Admin/STAFF fetch all
      setOrders(data.data);
    } catch (err) {
      console.log(err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Connect to STAFF room for real-time order updates
    const socket = getSocket();
    socket.emit("join_STAFF_dashboard");

    const handleOrderUpdated = (payload) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.orderCode === payload.orderCode
            ? { ...order, paymentStatus: payload.paymentStatus }
            : order,
        ),
      );
      toast.success(`Đơn hàng ${payload.orderCode} vừa được thanh toán!`);
    };

    socket.on("order_updated", handleOrderUpdated);

    return () => {
      socket.off("order_updated", handleOrderUpdated);
    };
  }, []);

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await api.put(`/staff/orders/${id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleUpdatePaymentStatus = async (id, status) => {
    try {
      await api.put(`/staff/orders/${id}/payment-status`, { status });
      toast.success("Cập nhật trạng thái thanh toán thành công");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải...</div>;
  }

  return (
    <div className="p-8 bg-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Quản Lý Đơn Hàng
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi, cập nhật trạng thái đơn hàng và thanh toán
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Mã Đơn / Khách hàng</th>
                <th className="px-6 py-4">Thông tin</th>
                <th className="px-6 py-4 text-center">PT Thanh Toán</th>
                <th className="px-6 py-4 text-center">Thanh Toán</th>
                <th className="px-6 py-4 text-center">Giao Hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900 mb-1">
                      {order.orderCode}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">
                      {order.user.fullName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {order.user.phone}
                    </div>
                    <div className="font-extrabold text-primary-600 mt-1">
                      {formatPrice(order.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      className={`text-xs font-bold border-0 rounded-lg px-2 py-1 focus:ring-2 cursor-pointer ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.paymentStatus === "FAILED"
                            ? "bg-primary-100 text-primary-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                      value={order.paymentStatus}
                      onChange={(e) =>
                        handleUpdatePaymentStatus(order.id, e.target.value)
                      }
                    >
                      <option value="PENDING">Chưa thanh toán</option>
                      <option value="PAID">Đã thanh toán</option>
                      <option value="FAILED">Thanh toán lỗi</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      className={`text-xs font-bold border-0 rounded-lg px-2 py-1 focus:ring-2 cursor-pointer ${
                        order.orderStatus === "DELIVERED" ||
                        order.orderStatus === "COMPLETED" ||
                        order.orderStatus === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.orderStatus === "CANCELLED" ||
                            order.orderStatus === "INVALID_ADDRESS" ||
                            order.orderStatus === "PAYMENT_FAILED"
                            ? "bg-primary-100 text-primary-700"
                            : order.orderStatus === "RETURNED" ||
                              order.orderStatus === "RETURN_REQUESTED"
                              ? "bg-red-100 text-red-700"
                              : order.orderStatus === "OUT_OF_STOCK"
                                ? "bg-orange-100 text-orange-700"
                                : order.orderStatus === "PENDING_VALIDATION"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-blue-100 text-blue-700"
                      }`}
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleUpdateOrderStatus(order.id, e.target.value)
                      }
                      disabled={[
                        "CANCELLED",
                        "PAYMENT_FAILED",
                        "INVALID_ADDRESS",
                        "RETURNED",
                      ].includes(order.orderStatus)}
                    >
                      <option value="PENDING">Chờ thanh toán</option>
                      <option value="PENDING_VALIDATION">Đang xác thực</option>
                      <option value="INVALID_ADDRESS">Địa chỉ không hợp lệ</option>
                      <option value="PAYMENT_FAILED">Thanh toán thất bại</option>
                      <option value="OUT_OF_STOCK">Hết hàng (Chờ CSKH)</option>
                      <option value="CONFIRMED">Đã xác thực</option>
                      <option value="PROCESSING">Đang xử lý</option>
                      <option value="SHIPPING">Đang giao hàng</option>
                      <option value="DELIVERED">Đã giao hàng</option>
                      <option value="COMPLETED">Đã hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                      <option value="RETURNED">Trả hàng / Hoàn tiền</option>
                      <option value="RETURN_REQUESTED">Yêu cầu trả hàng</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffOrderPage;
