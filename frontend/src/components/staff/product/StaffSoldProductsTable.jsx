/* eslint-disable react/prop-types */
import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80";

const resolveImage = (image) => {
  if (!image) return FALLBACK_IMAGE;
  return image.startsWith("/") ? `http://localhost:5000${image}` : image;
};

const StaffSoldProductsTable = ({ products }) => (
  <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
    {products.length === 0 ? (
      <div className="flex flex-col justify-center items-center py-20 text-slate-500">
        <ShoppingBag size={44} className="text-slate-600 mb-3" />
        <p className="text-sm font-bold">Chưa có sản phẩm nào được bán</p>
        <p className="text-xs text-slate-500 mt-1">
          Các sản phẩm phát sinh đơn hàng sẽ hiển thị tại đây.
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] bg-slate-50">
              <th className="px-3 py-2 ">Sản phẩm</th>
              <th className="px-3 py-2 text-center">Đã bán</th>
              <th className="px-3 py-2 text-center">Tồn kho</th>
              <th className="px-3 py-2 text-center">Số đơn hàng</th>
              <th className="px-3 py-2  text-right">Doanh thu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {products.map((product) => {
              const thumbnailSrc = resolveImage(product.thumbnail);

              return (
                <tr
                  key={product.productId}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0">
                        <img
                          src={thumbnailSrc}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.target.src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-2">
                          {product.name}
                        </p>
                        {product.lastSoldAt && (
                          <p className="text-[10px] text-slate-500 mt-1">
                            Bán gần nhất:{" "}
                            {new Date(product.lastSoldAt).toLocaleString(
                              "vi-VN",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold text-slate-900">
                      {product.soldQuantity}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold text-slate-900">
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold text-slate-900">
                      {product.orderCount}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-primary-600">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default StaffSoldProductsTable;
