/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  ExternalLink,
  FileText,
  Inbox,
  LogOut,
  Users,
  Package,
  LayoutDashboard,
  ShieldCheck,
  AlertCircle,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
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

const SIDEBAR_COLLAPSED_KEY = "staffSidebarCollapsed";

const StaffSidebar = ({ currentModule, onModuleChange, user, onLogout }) => {
  const isAdmin = user?.role === "ADMIN";
  const items = isAdmin ? [...navItems, ...adminOnlyNavItems] : navItems;
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true",
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    <aside
      className={`p-3 bg-white border-r border-slate-200 flex flex-col gap-3 min-h-full transition-all duration-200 ${
        collapsed ? "w-[64px] min-w-[64px]" : "min-w-[220px]"
      }`}
    >
      <div
        className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-extrabold text-sm tracking-wider text-primary-600 truncate">
              {isAdmin ? "QUẢN TRỊ HỆ THỐNG" : "QUẢN LÝ"}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-all shrink-0"
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <div
        className={`flex items-center gap-3 py-1.5 px-2 bg-slate-50 rounded-xl ${collapsed ? "justify-center" : " border border-slate-200"}`}
      >
        <div className="w-8 h-8 shrink-0 rounded-full bg-primary-600 flex items-center justify-center font-bold text-xs text-white">
          {user?.fullName?.[0]}
        </div>
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate leading-none text-slate-800">
              {user?.fullName}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {user?.role}
            </p>
          </div>
        )}
      </div>

      <div className="flex h-full justify-between flex-col mt-1 border-t border-slate-200 pt-3">
        <div className="flex flex-col gap-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onModuleChange(item.key)}
                title={collapsed ? item.label : undefined}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-primary-600 border-primary-700 text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Link
          to="/"
          title={collapsed ? "Shop" : undefined}
          className={`text-xs py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg flex items-center gap-2 no-underline transition-all ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <ExternalLink size={16} className="shrink-0" />{" "}
          {!collapsed && <span className="font-bold">Shop</span>}
        </Link>
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Đăng xuất" : undefined}
          className={`w-full py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 bg-primary-600 border-primary-700 text-white shadow-md ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={14} className="shrink-0" />
          {!collapsed && <span className="font-bold">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
