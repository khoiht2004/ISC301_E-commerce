import React, { useState } from 'react';
import axios from '../../services/axios';
import { toast } from 'react-hot-toast';

const OrderComplaintForm = ({ isOpen, onClose, orderId, orderCode, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast.error('Lý do khiếu nại phải có ít nhất 10 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/complaints', { orderId, reason });
      toast.success('Gửi khiếu nại thành công! Chúng tôi sẽ xử lý sớm nhất.');
      onSuccess();
      setReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi khiếu nại');
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
          <h3 className="text-xl font-bold text-slate-800">Khiếu nại đơn hàng</h3>
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
          <div className="mb-4 text-sm text-slate-600">
            Bạn đang khiếu nại đơn hàng <span className="font-bold text-slate-800">#{orderCode}</span>.
            Vui lòng cung cấp chi tiết vấn đề bạn đang gặp phải.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="reason" className="block text-sm font-bold text-slate-700 mb-2">
                Lý do khiếu nại <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                placeholder="Nhập lý do khiếu nại của bạn (ít nhất 10 ký tự)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
              <p className="text-xs text-slate-500 mt-2">
                Càng chi tiết càng giúp chúng tôi xử lý nhanh chóng hơn.
              </p>
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
                disabled={isSubmitting || reason.trim().length < 10}
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
                  'Gửi khiếu nại'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderComplaintForm;
