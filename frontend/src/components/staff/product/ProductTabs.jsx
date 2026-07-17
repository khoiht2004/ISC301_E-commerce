import { STAFF_PRODUCT_TABS } from "../../../constants/staffProductTabs";

const ProductTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { value: STAFF_PRODUCT_TABS.PRODUCTS, label: "Tất cả sản phẩm" },
    { value: STAFF_PRODUCT_TABS.SOLD, label: "Sản phẩm đã bán" },
  ];

  return (
    <div className="flex w-max rounded-xl border border-slate-200 bg-slate-50 p-2 shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-lg px-3 py-2 text-xs font-extrabold transition-colors ${
            activeTab === tab.value
              ? "bg-primary-600 text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProductTabs;
