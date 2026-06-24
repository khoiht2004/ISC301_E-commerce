import React, { useState, useEffect } from 'react';
import api from '../../services/axios';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await api.get(`/reviews/product/${productId}`);
        if (res.data?.success) {
          setReviews(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="py-8 text-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto mb-2"></div>
        Đang tải đánh giá...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 bg-slate-50 rounded-2xl border border-slate-100 text-center">
        <div className="text-4xl mb-3">⭐</div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Chưa có đánh giá nào</h3>
        <p className="text-sm text-slate-500">Hãy là người đầu tiên đánh giá sản phẩm này sau khi mua hàng nhé!</p>
      </div>
    );
  }

  const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
  
  return (
    <div className="mt-8">
      <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="text-center">
          <div className="text-4xl font-black text-amber-500 leading-none mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex text-amber-400 justify-center mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'text-amber-500' : 'text-slate-300'}`}>
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
            ))}
          </div>
          <div className="text-xs font-bold text-slate-500">{reviews.length} đánh giá</div>
        </div>
        
        {/* Rating Bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter(r => r.rating === star).length;
            const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 w-8 text-slate-600 font-bold">
                  {star} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-amber-500"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                </div>
                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="w-8 text-right text-slate-500 text-xs font-bold">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                  {review.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">
                    {review.user?.fullName || 'Khách hàng'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${star <= review.rating ? 'text-amber-500' : 'text-slate-200'}`}>
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
