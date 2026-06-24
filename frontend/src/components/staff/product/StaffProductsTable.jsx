/* eslint-disable react/prop-types */
import { AlertCircle, Edit, Eye, Power, Trash2 } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80";

const resolveImage = (image) => {
  if (!image) return FALLBACK_IMAGE;
  return image.startsWith("/") ? `http://localhost:5000${image}` : image;
};

const StaffProductsTable = ({
  loading,
  products,
  onEdit,
  onDelete,
  onTogglePublish,
}) => (
  <div className="flex-1 overflow-auto bg-white border border-slate-200 rounded-2xl shadow-sm relative">
    {loading ? (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">
          Đang tải danh sách sản phẩm...
        </p>
      </div>
    ) : products.length === 0 ? (
      <div className="flex flex-col justify-center items-center py-20 text-slate-500">
        <AlertCircle size={44} className="text-slate-600 mb-3" />
        <p className="text-sm font-bold">Không tìm thấy sản phẩm nào</p>
        <p className="text-xs text-slate-500 mt-1">
          Hãy thử tìm kiếm với từ khóa khác hoặc thêm sản phẩm mới.
        </p>
      </div>
    ) : (
      <>
        <table className="w-full text-left border-collapse text-xs md:text-sm whitespace-nowrap min-w-[800px]">
          <thead className="sticky top-0 z-10">
            <tr className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <th className="p-3 bg-slate-50 border-b border-slate-200">Ảnh</th>
              <th className="p-3 bg-slate-50 border-b border-slate-200">Sản phẩm</th>
              <th className="p-3 bg-slate-50 border-b border-slate-200">SKU / Nhãn</th>
              <th className="p-3 bg-slate-50 border-b border-slate-200">Giá bán</th>
              <th className="p-3 bg-slate-50 border-b border-slate-200 text-center">Tồn kho</th>
              <th className="p-3 bg-slate-50 border-b border-slate-200 text-center">Hiển thị</th>
              <th className="p-3 bg-slate-50 border-b border-slate-200 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {products.map((product) => {
              const thumbnailSrc = resolveImage(product.thumbnail);
              const hasDiscount =
                product.salePrice && product.salePrice < product.price;

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-3 shrink-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                      <img
                        src={thumbnailSrc}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-3 max-w-[220px]">
                    <button
                      type="button"
                      className="text-left font-bold text-slate-800 line-clamp-2 hover:text-primary-600 transition-colors"
                      onClick={() => onEdit(product)}
                    >
                      {product.name}
                    </button>
                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      {product.slug}
                    </div>
                  </td>
                  <td className="p-3 max-w-[200px]">
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {product.sku || "Chưa có SKU"}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {product.tags?.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    {hasDiscount ? (
                      <>
                        <span className="text-primary-600 font-bold block">
                          {formatCurrency(product.salePrice)}
                        </span>
                        <span className="text-slate-500 line-through text-[10px]">
                          {formatCurrency(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-800 font-bold block">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        product.stock > 10
                          ? "bg-emerald-100 text-emerald-700"
                          : product.stock > 0
                            ? "bg-amber-100 text-amber-700"
                            : "bg-primary-100 text-primary-700"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => onTogglePublish(product.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        product.isPublished
                          ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700"
                      }`}
                      title={
                        product.isPublished
                          ? "Gỡ công khai (đang hiện)"
                          : "Bật công khai (đang ẩn)"
                      }
                    >
                      <Power size={14} />
                    </button>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {product.isPublished && (
                        <a
                          href={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
                          title="Xem trang bán hàng"
                        >
                          <Eye size={14} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-1.5 bg-white hover:bg-slate-100 text-primary-600 hover:text-primary-700 rounded-lg transition-colors border border-slate-200"
                        title="Chỉnh sửa"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        className="p-1.5 bg-white hover:bg-red-50 text-slate-500 hover:text-primary-600 rounded-lg transition-colors border border-slate-200"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    )}
  </div>
);

export default StaffProductsTable;
