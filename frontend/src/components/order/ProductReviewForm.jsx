import React, { useState } from 'react';
import axios from '../../services/axios';
import { toast } from 'react-hot-toast';

const ProductReviewForm = ({ isOpen, onClose, orderId, product, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/reviews', {
        productId: product.id,
        orderId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success('Đánh giá sản phẩm thành công!');
      onSuccess();
      setRating(5);
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">Đánh giá sản phẩm</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <img 
              src={product.thumbnail || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'} 
              alt={product.name} 
              className="w-16 h-16 rounded-xl object-cover border border-slate-100"
            />
            <div>
              <h4 className="font-bold text-slate-800 line-clamp-2">{product.name}</h4>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex flex-col items-center">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Chất lượng sản phẩm
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className={`w-10 h-10 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm font-bold text-amber-600">
                {rating === 1 && 'Tệ'}
                {rating === 2 && 'Không hài lòng'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Hài lòng'}
                {rating === 5 && 'Tuyệt vời'}
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="comment" className="block text-sm font-bold text-slate-700 mb-2">
                Nhận xét chi tiết (Không bắt buộc)
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none text-sm"
                placeholder="Chia sẻ thêm về trải nghiệm của bạn với sản phẩm này..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                disabled={isSubmitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi đánh giá'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewForm;
