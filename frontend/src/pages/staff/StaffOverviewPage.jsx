/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import { Users, ShoppingBag, LayoutDashboard, BarChart3 } from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-start">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-900">{value}</h3>
    </div>
    <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
  </div>
);

const StaffOverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/dashboard-stats");
      setStats(data.data);
    } catch {
      toast.error("Không thể tải dữ liệu tổng quan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải...</div>;
  }

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
          onClick={fetchStats}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Users"
          value={stats?.users ?? 0}
          icon={<Users className="text-blue-500" />}
        />
        <StatCard
          title="Sản phẩm"
          value={stats?.products ?? 0}
          icon={<ShoppingBag className="text-purple-500" />}
        />
        <StatCard
          title="Đơn hàng"
          value={stats?.orders ?? 0}
          icon={<LayoutDashboard className="text-orange-500" />}
        />
        <StatCard
          title="Doanh thu"
          value={formatPrice(stats?.revenue)}
          icon={<BarChart3 className="text-green-500" />}
        />
      </div>
    </div>
  );
};

export default StaffOverviewPage;
