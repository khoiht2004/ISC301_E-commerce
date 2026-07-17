import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "../services/axios";
import AddressSelectForm from "../components/common/AddressSelectForm";
import { Banknote, Check, MapPin } from "lucide-react";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, loading, fetchCart } = useCart();

  const [formData, setFormData] = useState({
    shippingAddress: user?.address || "",
    customerPhone: user?.phone || "",
    customerEmail: user?.email || "",
    note: "",
    paymentMethod: "COD",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const hasFullProfileAddress = !!(
    user?.address &&
    user?.province_id &&
    user?.district_id &&
    user?.ward_id &&
    user?.street_address &&
    user?.phone
  );

  const [useProfileAddress, setUseProfileAddress] = useState(
    hasFullProfileAddress,
  );

  // Sync combined shipping address
  useEffect(() => {
    if (useProfileAddress) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: user?.address || "",
      }));
    }
  }, [useProfileAddress, user?.address]);

  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      navigate("/login");
      return;
    }

    const checkCartOnMount = async () => {
      try {
        const { data } = await axios.get("/cart");
        if (!data.data || !data.data.items || data.data.items.length === 0) {
          toast.error("Giỏ hàng trống");
          navigate("/cart");
        } else {
          // Sync with the global CartContext
          await fetchCart();
          setIsChecking(false);
        }
      } catch (err) {
        console.error("Error checking cart:", err);
        toast.error("Không thể tải thông tin giỏ hàng");
        navigate("/cart");
      }
    };

    checkCartOnMount();
  }, [user, navigate, fetchCart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.shippingAddress ||
      !formData.customerPhone ||
      !formData.customerEmail
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    // Build granular payload fields for step-by-step automatic validation
    const payload = {
      ...formData,
      province_id: useProfileAddress ? user.province_id : formData.province_id,
      district_id: useProfileAddress ? user.district_id : formData.district_id,
      ward_id: useProfileAddress ? user.ward_id : formData.ward_id,
      street_address: useProfileAddress
        ? user.street_address
        : formData.street_address,
      receiver_phone: useProfileAddress ? user.phone : formData.customerPhone,
    };

    try {
      setIsSubmitting(true);
      const { data } = await axios.post("/orders", payload);

      if (data.success) {
        toast.success("Đặt hàng thành công!");
        await fetchCart();

        if (formData.paymentMethod === "BANK_TRANSFER") {
          navigate(`/payment/${data.data.orderCode}`);
        } else {
          navigate(`/order-success/${data.data.orderCode}`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi đặt hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading || isChecking || cartItems.length === 0) return null;

  return (
    <div className="bg-slate-50 min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-3">
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
            Thanh toán
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            Hoàn Tất Đơn Hàng
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Form */}
          <div className="w-full lg:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Info */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="text-primary-500" size={20} />
                  Thông tin giao hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user?.address && (
                    <div className="md:col-span-2 mb-2">
                      {hasFullProfileAddress ? (
                        <>
                          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-200/60 transition-colors">
                            <input
                              type="checkbox"
                              checked={useProfileAddress}
                              onChange={(e) =>
                                setUseProfileAddress(e.target.checked)
                              }
                              className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-slate-700">
                              Sử dụng địa chỉ mặc định trong hồ sơ
                            </span>
                          </label>
                          {useProfileAddress && (
                            <div className="mt-2 text-xs text-slate-500 italic px-3">
                              Địa chỉ giao hàng:{" "}
                              <strong className="text-slate-800 font-semibold">
                                {user.address}
                              </strong>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
                          ⚠️ Địa chỉ mặc định trong hồ sơ chưa đầy đủ thông tin
                          hành chính. Vui lòng chọn địa chỉ giao hàng chi tiết
                          bên dưới để cập nhật lại.
                        </div>
                      )}
                    </div>
                  )}

                  {!useProfileAddress && (
                    <div className="md:col-span-2">
                      <AddressSelectForm
                        initialValues={{
                          province_id: formData.province_id || "",
                          district_id: formData.district_id || "",
                          ward_id: formData.ward_id || "",
                          street_address: formData.street_address || "",
                          phone: formData.customerPhone || "",
                          email: formData.customerEmail || "",
                        }}
                        onChange={(data) => {
                          setFormData((prev) => ({
                            ...prev,
                            province_id: data.province_id,
                            district_id: data.district_id,
                            ward_id: data.ward_id,
                            street_address: data.street_address,
                            customerPhone: data.phone,
                            customerEmail: data.email,
                            shippingAddress: data.combinedAddress,
                          }));
                        }}
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ghi chú đơn hàng (Tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder="Ghi chú về thời gian giao hàng, hướng dẫn chỉ đường..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all h-24 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Banknote className="text-primary-500" size={20} />
                  Phương thức thanh toán
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    className={`relative flex flex-col py-2.5 px-3 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === "COD" ? "border-primary-500 bg-primary-50/50" : "border-slate-200 hover:border-primary-200"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">
                        Thanh toán tiền mặt
                      </span>
                      {formData.paymentMethod === "COD" && (
                        <div className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                  </label>

                  <label
                    className={`relative flex flex-col py-2.5 px-3 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === "BANK_TRANSFER" ? "border-primary-500 bg-primary-50/50" : "border-slate-200 hover:border-primary-200"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={formData.paymentMethod === "BANK_TRANSFER"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">
                        Chuyển khoản ngân hàng
                      </span>
                      {formData.paymentMethod === "BANK_TRANSFER" && (
                        <div className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      Quét mã QR tự động xác nhận
                    </span>
                    {formData.paymentMethod === "BANK_TRANSFER" && (
                      <div className="mt-3 p-3 bg-white/85 rounded-xl border border-primary-100/50 text-xs text-slate-700 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Ngân hàng:</span>
                          <span className="font-semibold text-slate-800">
                            MB Bank
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Số tài khoản:</span>
                          <span className="font-bold text-primary-600 tracking-wider">
                            01112172004
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Chủ tài khoản:</span>
                          <span className="font-semibold text-slate-800">
                            HÀ TUẤN KHÔI
                          </span>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 sticky top-28">
              <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100 mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                {cartItems.map((item) => (
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
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight">
                        {item.product.name}
                      </h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-500">
                          x{item.quantity}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {formatPrice(
                            (item.product.salePrice || item.product.price) *
                              item.quantity,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tạm tính</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Phí giao hàng</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    Miễn phí
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="text-base font-bold text-slate-800">
                    Tổng cộng
                  </span>
                  <span className="text-xl font-extrabold text-primary-600">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Đang xử lý..." : "Đặt hàng ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
