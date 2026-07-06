import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, addingToCartId, handleAddToCart }) => {
  const navigate = useNavigate();

  const fallbackImg = "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80";
  const mainImage = product.images?.[0] || product.thumbnail || fallbackImg;
  const onSale = product.salePrice && product.salePrice < product.price;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getTagColorClass = (slug) => {
    const schemes = {
      "thit-bo": "bg-primary-50 text-primary-700 border-primary-200",
      "thit-heo": "bg-pink-50 text-pink-700 border-pink-200",
      "thit-ga": "bg-amber-50 text-amber-700 border-amber-200",
      "xuc-xich": "bg-orange-50 text-orange-700 border-orange-200",
      "do-hop": "bg-blue-50 text-blue-700 border-blue-200",
      "nhap-khau": "bg-purple-50 text-purple-700 border-purple-200",
      "khuyen-mai": "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return schemes[slug] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.slug}`)}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Sale Badge */}
        {onSale && (
          <span className="absolute top-3 left-3 bg-primary-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm z-10 animate-pulse">
            Giảm giá
          </span>
        )}
        {/* Stock Status Badge */}
        <span
          className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm z-10 ${
            product.stock > 0
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-primary-50 text-primary-700 border border-primary-100"
          }`}
        >
          {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2.5">
            {product.tags &&
              product.tags.slice(0, 3).map((tag, idx) => {
                const tagObj = typeof tag === 'string' ? { slug: tag, name: tag, id: idx } : tag;
                return (
                  <span
                    key={tagObj.id || idx}
                    className={`text-[9px] font-semibold px-2 py-0.5 border rounded-full ${getTagColorClass(tagObj.slug)}`}
                  >
                    {tagObj.name}
                  </span>
                );
              })}
          </div>

          {/* Title & Description */}
          <h3 className="font-bold text-slate-800 text-base mb-1.5 group-hover:text-primary-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-slate-500 text-xs font-light line-clamp-2 mb-4 leading-relaxed">
            {product.shortDescription || product.description || "Chưa có mô tả ngắn về sản phẩm."}
          </p>
        </div>

        {/* Footer: Price & Add button */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {onSale ? (
              <>
                <span className="text-xs text-slate-400 line-through font-light leading-none">
                  {formatPrice(product.price)}
                </span>
                <span className="text-base font-bold text-primary-600 leading-tight mt-0.5">
                  {formatPrice(product.salePrice)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-slate-800 leading-tight">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            disabled={product.stock <= 0 || addingToCartId === product.id}
            onClick={(e) => handleAddToCart(product.id, e)}
            className={`p-2 rounded-xl transition-all duration-200 border flex items-center justify-center ${
              product.stock <= 0
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-primary-50 text-primary-600 border-primary-150 hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:scale-105 active:scale-95 shadow-sm"
            }`}
            title={product.stock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
          >
            {addingToCartId === product.id ? (
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
