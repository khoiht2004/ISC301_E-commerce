import { Archive, ClipboardList, Package, ShoppingBag } from "lucide-react";
import StatCard from "../StatCard";

const ProductStatsGrid = ({ stats }) => {
  const publishedCount = stats?.publishedProductCount ?? 0;
  const totalStock = stats?.totalStock ?? 0;

  const statCards = [
    {
      label: "Tổng sản phẩm",
      value: stats?.productCount ?? 0,
      helper: `${publishedCount} sản phẩm đang bán`,
      icon: Package,
    },
    {
      label: "Đã bán",
      value: stats?.soldQuantity ?? 0,
      helper: "Tổng số lượng đã bán",
      icon: ShoppingBag,
    },
    {
      label: "Tồn kho",
      value: totalStock,
      helper: `${stats?.lowStockCount ?? 0} sản phẩm sắp hết hàng`,
      icon: Archive,
    },
    {
      label: "Tổng đơn hàng",
      value: stats?.orderCount ?? 0,
      helper: "Đơn có sản phẩm của nhân viên",
      icon: ClipboardList,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5 shrink-0">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
};

export default ProductStatsGrid;
