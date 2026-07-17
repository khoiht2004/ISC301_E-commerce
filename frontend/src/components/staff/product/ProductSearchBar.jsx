/* eslint-disable react/prop-types */
import { Search } from "lucide-react";

const ProductSearchBar = ({
  value,
  onChange,
  className = "",
  placeholder = "Tìm kiếm sản phẩm theo tên, SKU hoặc nhãn...",
}) => (
  <div
    className={`${className} bg-slate-50 border border-slate-200 rounded-2xl p-2 flex gap-4 items-center shrink-0`}
  >
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 focus:border-primary-600 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-staff-primary transition-all placeholder:text-slate-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </div>
);

export default ProductSearchBar;
