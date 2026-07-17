import { useState, useEffect } from "react";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import { BarChart3, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/staff/StatCard";
import ProductStatsGrid from "../../components/staff/product/ProductStatsGrid";
import { useStaffProductStats } from "../../hooks/useStaffProductStats";
import { formatPrice } from "../../utils/helper";

const StaffOverviewPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Số liệu sản phẩm/đơn hàng: dùng chung cho cả STAFF và ADMIN
  const { stats: productStats, refreshStaffProductStats } =
    useStaffProductStats();

  // Số liệu tổng hợp toàn hệ thống (doanh thu, khiếu nại, top sản phẩm, đơn hàng gần đây):
  // dùng chung cho cả STAFF và ADMIN - trang Tổng quan hiển thị giống nhau cho mọi role
  const [adminStats, setAdminStats] = useState(null);
  const [loadingAdminStats, setLoadingAdminStats] = useState(true);

  const fetchAdminStats = async () => {
    setLoadingAdminStats(true);
    try {
      const { data } = await api.get("/admin/dashboard-stats");
      setAdminStats(data.data);
    } catch {
      toast.error("Không thể tải dữ liệu tổng quan");
    } finally {
      setLoadingAdminStats(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleRefresh = () => {
    refreshStaffProductStats();
    fetchAdminStats();
  };

  return (
    <div className="p-8 bg-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Tổng Quan Hệ Thống
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Số liệu tổng hợp toàn bộ cửa hàng
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Làm mới
        </button>
      </div>

      <ProductStatsGrid stats={productStats} />

      {loadingAdminStats ? (
        <div className="p-8 text-center text-slate-500">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            {isAdmin && (
              <StatCard
                label="Doanh thu"
                value={formatPrice(adminStats?.revenue)}
                icon={BarChart3}
              />
            )}
            <StatCard
              label="Khiếu nại chờ xử lý"
              value={adminStats?.activeComplaints ?? 0}
              icon={AlertCircle}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Top Products */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-primary-600" />
                <h3 className="text-lg font-bold text-slate-800">
                  Sản phẩm bán chạy
                </h3>
              </div>
              <div className="space-y-4">
                {adminStats?.topProducts?.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                        #{index + 1}
                      </div>
                      <span className="font-semibold text-slate-700">
                        {product.productName}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-500 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">
                      {product.totalSold} đã bán
                    </span>
                  </div>
                ))}
                {!adminStats?.topProducts?.length && (
                  <p className="text-center text-slate-500 py-4 text-sm">
                    Chưa có dữ liệu sản phẩm
                  </p>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="text-primary-600" />
                <h3 className="text-lg font-bold text-slate-800">
                  Đơn hàng gần đây
                </h3>
              </div>
              <div className="space-y-4">
                {adminStats?.recentOrders?.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        #{order.orderCode}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.user?.fullName} •{" "}
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="font-black text-primary-700">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm uppercase font-bold">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {!adminStats?.recentOrders?.length && (
                  <p className="text-center text-slate-500 py-4 text-sm">
                    Chưa có đơn hàng nào
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffOverviewPage;
