/* eslint-disable react/prop-types */
import {
  ExternalLink,
  FileText,
  Inbox,
  LogOut,
  MessageCircle,
  Shield,
  Users,
  Package,
} from "lucide-react";

const navItems = [
  { key: "crm", label: "Hỗ trợ khách hàng", icon: MessageCircle },
  { key: "products", label: "Quản lý sản phẩm", icon: Inbox },
  { key: "news", label: "Quản lý tin tức", icon: FileText },
  { key: "orders", label: "Quản lý đơn hàng", icon: Users },
  { key: "batches", label: "Quản lý lô hàng", icon: Package },
];

const StaffSidebar = ({ currentModule, onModuleChange, user, onLogout }) => (
  <aside className="p-3 bg-white border-r border-slate-200 flex flex-col gap-3 min-h-full">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="text-primary-600" size={22} />
        <span className="font-extrabold text-sm tracking-wider text-primary-600">
          STAFF CRM
        </span>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
        title="Đăng xuất"
      >
        <LogOut size={16} />
      </button>
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
      <a
        href="/"
        className="text-[10px] bg-white hover:bg-slate-200 text-slate-800 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 no-underline transition-all"
      >
        Shop <ExternalLink size={10} />
      </a>
    </div>

    <div className="flex flex-col gap-1.5 mt-1 border-t border-slate-200 pt-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentModule === item.key;

        return (
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
        );
      })}
    </div>
  </aside>
);

export default StaffSidebar;
