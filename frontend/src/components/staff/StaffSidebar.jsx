/* eslint-disable react/prop-types */
import {
  ExternalLink,
  FileText,
  Inbox,
  LogOut,
  Shield,
  Users,
  Package,
  LayoutDashboard,
  ShieldCheck,
  AlertCircle,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { key: "orders", label: "Quản lý đơn hàng", icon: Users },
  { key: "batches", label: "Quản lý lô hàng", icon: Package },
  { key: "products", label: "Quản lý sản phẩm", icon: Inbox },
  { key: "complaints", label: "Quản lý khiếu nại", icon: AlertCircle },
  { key: "discounts", label: "Gợi ý giảm giá", icon: Tag },
  { key: "news", label: "Quản lý tin tức", icon: FileText },
  // { key: "crm", label: "Hỗ trợ khách hàng", icon: MessageCircle },
];

const adminOnlyNavItems = [
  { key: "users", label: "Quản lý user", icon: ShieldCheck },
];

const StaffSidebar = ({ currentModule, onModuleChange, user, onLogout }) => {
  const isAdmin = user?.role === "ADMIN";
  const items = isAdmin ? [...navItems, ...adminOnlyNavItems] : navItems;

  return (
    <aside className="p-3 bg-white border-r min-w-[220px] border-slate-200 flex flex-col gap-3 min-h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="text-primary-600" size={22} />
          <span className="font-extrabold text-sm tracking-wider text-primary-600">
            {isAdmin ? "QUẢN TRỊ HỆ THỐNG" : "STAFF CRM"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 py-1.5 px-2 bg-slate-50 rounded-xl border border-slate-200">
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-xs text-white">
          {user?.fullName?.[0]}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold truncate leading-none text-slate-800">
            {user?.fullName}
          </p>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {user?.role}
          </p>
        </div>
      </div>

      <div className="flex h-full justify-between flex-col mt-1 border-t border-slate-200 pt-3">
        <div className="flex flex-col gap-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.key;

            return (
              <>
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onModuleChange(item.key)}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-primary-600 border-primary-700 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              </>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Link
          to="/"
          className="text-xs py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg flex items-center gap-2 no-underline transition-all"
        >
          <ExternalLink size={16} /> <span className="font-bold">Shop</span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className={`w-full py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 bg-primary-600 border-primary-700 text-white shadow-md`}
          title="Đăng xuất"
        >
          <LogOut size={14} />
          <span className="font-bold">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
