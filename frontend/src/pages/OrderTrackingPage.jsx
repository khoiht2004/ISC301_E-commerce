import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../services/axios";
import { getSocket } from "../services/socketService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Check, ChevronDown } from "lucide-react";
import OrderComplaintForm from "../components/order/OrderComplaintForm";
import ProductReviewForm from "../components/order/ProductReviewForm";
import { formatDate, formatPrice } from "../utils/helper";

const OrderTrackingPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myComplaints, setMyComplaints] = useState([]);
  const [isDeliveryInfoOpen, setIsDeliveryInfoOpen] = useState(false);

  const [complaintModalType, setComplaintModalType] = useState(null); // null | 'COMPLAINT' | 'RETURN_REQUEST'
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/orders/${id}`);
      setOrder(data.data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyComplaints = async () => {
    try {
      const { data } = await axios.get("/complaints/my-complaints");
      setMyComplaints(data.data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchMyComplaints();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    socket.emit("join_user_room", user.id);

    const handlePaymentSuccess = (payload) => {
      if (order && payload.orderCode === order.orderCode) {
        setOrder((prev) => ({
          ...prev,
          paymentStatus: "PAID",
          orderStatus: "PROCESSING",
          paidAt: new Date().toISOString(),
        }));
      }
    };

    socket.on("payment_success", handlePaymentSuccess);

    return () => {
      socket.off("payment_success", handlePaymentSuccess);
    };
  }, [user, order]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?"))
      return;
    try {
      await axios.put(`/orders/${order.id}/cancel`);
      toast.success("Hủy đơn hàng thành công");
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Không tìm thấy đơn hàng
        </h2>
        <Link to="/" className="mt-4 text-primary-600 hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const getOrderStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ thanh toán";
      case "PENDING_VALIDATION":
        return "Đang xác thực";
      case "INVALID_ADDRESS":
        return "Địa chỉ không hợp lệ";
      case "PAYMENT_FAILED":
        return "Thanh toán thất bại";
      case "OUT_OF_STOCK":
        return "Hết hàng (Chờ CSKH)";
      case "CONFIRMED":
        return "Đã xác thực";
      case "PROCESSING":
        return "Đang xử lý";
      case "SHIPPING":
        return "Đang giao hàng";
      case "DELIVERED":
        return "Đã giao hàng";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "RETURNED":
        return "Trả hàng / Hoàn tiền";
      case "RETURN_REQUESTED":
        return "Đang yêu cầu trả hàng";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chưa thanh toán";
      case "PAID":
        return "Đã thanh toán";
      case "FAILED":
        return "Thanh toán lỗi";
      default:
        return status;
    }
  };

  const orderSteps = [
    "PENDING_VALIDATION",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPING",
    "DELIVERED",
    "COMPLETED",
  ];
  const normalizedStatus =
    order.orderStatus === "PENDING" ? "PENDING_VALIDATION" : order.orderStatus;
  const currentStepIndex = orderSteps.indexOf(normalizedStatus);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between my-6">
          <h1 className="text-2xl font-extrabold text-slate-800">
            Chi Tiết Đơn Hàng
          </h1>
          <Link
            to="/my-orders"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            ← Trở về danh sách
          </Link>
        </div>

        {/* Status Tracker */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                Mã đơn hàng{" "}
                <span className="font-bold text-slate-800">
                  {order.orderCode}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium  tracking-wide">
                Ngày đặt hàng{" "}
                <span className="font-bold text-slate-800">
                  {formatDate(order.createdAt)}
                </span>
              </p>
            </div>
          </div>

          {[
            "CANCELLED",
            "INVALID_ADDRESS",
            "PAYMENT_FAILED",
            "OUT_OF_STOCK",
            "RETURNED",
            "RETURN_REQUESTED",
          ].includes(order.orderStatus) ? (
            <div
              className={`p-2.5 rounded-xl text-center font-bold ${
                order.orderStatus === "OUT_OF_STOCK"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : ["RETURNED", "RETURN_REQUESTED"].includes(order.orderStatus)
                    ? "bg-rose-50 text-rose-700 border border-rose-100"
                    : "bg-primary-50 text-primary-600 border border-primary-100"
              }`}
            >
              {order.orderStatus === "CANCELLED" && "Đơn hàng này đã bị hủy."}
              {order.orderStatus === "INVALID_ADDRESS" &&
                "Đơn hàng có địa chỉ không hợp lệ. Vui lòng tạo đơn hàng mới với thông tin địa chỉ chính xác."}
              {order.orderStatus === "PAYMENT_FAILED" &&
                "Thanh toán thất bại hoặc quá hạn 15 phút. Đơn hàng đã bị hủy."}
              {order.orderStatus === "OUT_OF_STOCK" &&
                "Đơn hàng tạm thời hết hàng trong kho. Bộ phận CSKH đang tiến hành xử lý thủ công."}
              {order.orderStatus === "RETURNED" &&
                "Đơn hàng này đã được Trả hàng / Hoàn tiền thành công."}
              {order.orderStatus === "RETURN_REQUESTED" &&
                "Bạn đã gửi yêu cầu Trả hàng / Hoàn tiền. Cửa hàng đang xem xét xử lý."}
            </div>
          ) : (
            <div className="relative pt-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>

              <div
                className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                style={{
                  width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%`,
                }}
              ></div>

              <div className="relative z-10 flex justify-between">
                {orderSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-500 text-white ring-4 ring-green-100"
                            : "bg-white text-slate-400 border-2 border-slate-200"
                        }`}
                      >
                        {isCompleted ? <Check /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs md:text-sm font-semibold ${isActive ? "text-slate-800" : isCompleted ? "text-green-600" : "text-slate-400"}`}
                      >
                        {getOrderStatusText(step)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Products List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="font-bold text-base text-slate-800 border-b border-slate-100 pb-3 mb-3">
              Sản Phẩm
            </h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                    <img
                      src={
                        item.product.thumbnail ||
                        "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
                      }
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-2">
                      {item.product.name}
                    </h4>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-slate-500">
                        Số lượng: {item.quantity}
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    {order.orderStatus === "COMPLETED" && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            setReviewProduct(item.product);
                            setIsReviewModalOpen(true);
                          }}
                          className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          Đánh giá sản phẩm
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 mt-6 pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-800">Tổng cộng</span>
              <span className="text-xl font-extrabold text-primary-600">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setIsDeliveryInfoOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <h3 className="font-bold text-base text-slate-800">
                  Thông Tin Giao Hàng
                </h3>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform shrink-0 ${
                    isDeliveryInfoOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isDeliveryInfoOpen && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2.5 text-sm">
                  <p>
                    <span className="text-slate-500 w-24 inline-block">
                      Họ tên:
                    </span>{" "}
                    <span className="font-bold text-slate-800">
                      {order.user.fullName}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500 w-24 inline-block">
                      Điện thoại:
                    </span>{" "}
                    <span className="font-bold text-slate-800">
                      {order.customerPhone}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500 w-24 inline-block">
                      Email:
                    </span>{" "}
                    <span className="font-bold text-slate-800">
                      {order.customerEmail}
                    </span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-slate-500 w-24 inline-block shrink-0">
                      Địa chỉ:
                    </span>
                    <span className="font-bold text-slate-800">
                      {order.shippingAddress}
                    </span>
                  </p>
                  {order.note && (
                    <p className="flex items-start">
                      <span className="text-slate-500 w-24 inline-block shrink-0">
                        Ghi chú:
                      </span>
                      <span className="font-bold text-slate-800">
                        {order.note}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="font-bold text-base text-slate-800 border-b border-slate-100 pb-3 mb-3">
                Thanh Toán
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Phương thức</span>
                  <span className="text-sm font-bold text-slate-800">
                    {order.paymentMethod === "COD"
                      ? "Tiền mặt (COD)"
                      : "Chuyển khoản (QR)"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Trạng thái</span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      order.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.paymentStatus === "FAILED"
                          ? "bg-primary-100 text-primary-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
                {order.paymentStatus === "PENDING" &&
                  order.paymentMethod === "BANK_TRANSFER" && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <Link
                        to={`/order-success/${order.id}`}
                        className="block w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-center text-sm transition-all shadow-md"
                      >
                        Mở lại mã QR thanh toán
                      </Link>
                    </div>
                  )}
              </div>
            </div>

            {order.orderStatus === "COMPLETED" && (
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="font-bold text-base text-slate-800 border-b border-slate-100 pb-3 mb-3">
                  Hỗ trợ
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Nếu bạn gặp vấn đề với đơn hàng, vui lòng gửi khiếu nại hoặc
                  yêu cầu trả hàng / hoàn tiền.
                </p>
                <div className="flex gap-3">
                  {(() => {
                    const complaint = myComplaints.find(
                      (c) => c.orderId === order.id && c.type === "COMPLAINT",
                    );
                    return complaint ? (
                      <div className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm font-bold text-slate-500">
                        Đã gửi khiếu nại
                      </div>
                    ) : (
                      <button
                        onClick={() => setComplaintModalType("COMPLAINT")}
                        className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg text-center text-sm transition-all"
                      >
                        Khiếu nại đơn hàng
                      </button>
                    );
                  })()}
                  {(() => {
                    const returnRequest = myComplaints.find(
                      (c) =>
                        c.orderId === order.id && c.type === "RETURN_REQUEST",
                    );
                    return returnRequest ? (
                      <div className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm font-bold text-slate-500">
                        Đang yêu cầu trả hàng
                      </div>
                    ) : (
                      <button
                        onClick={() => setComplaintModalType("RETURN_REQUEST")}
                        className="w-full py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold rounded-lg text-center text-sm transition-all"
                      >
                        Trả hàng / Hoàn tiền
                      </button>
                    );
                  })()}
                </div>
              </section>
            )}
            {["PENDING_VALIDATION", "CONFIRMED", "PROCESSING"].includes(
              order.orderStatus,
            ) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="font-bold text-base text-slate-800 border-b border-slate-100 pb-3 mb-3">
                  Hủy Đơn Hàng
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Bạn có thể hủy đơn hàng nếu đơn hàng chưa được giao cho đơn vị
                  vận chuyển.
                </p>
                <button
                  onClick={handleCancelOrder}
                  className="w-full py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 font-bold rounded-lg text-center text-sm transition-all"
                >
                  Yêu cầu hủy đơn hàng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderComplaintForm
        isOpen={!!complaintModalType}
        type={complaintModalType || "COMPLAINT"}
        onClose={() => setComplaintModalType(null)}
        orderId={order.id}
        orderCode={order.orderCode}
        onSuccess={() => {
          setComplaintModalType(null);
          fetchMyComplaints();
          fetchOrder();
        }}
      />

      <ProductReviewForm
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={order.id}
        product={reviewProduct}
        onSuccess={() => {
          setIsReviewModalOpen(false);
          setReviewProduct(null);
        }}
      />
    </div>
  );
};

export default OrderTrackingPage;
