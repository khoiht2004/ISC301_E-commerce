/* eslint-disable react/prop-types */
import { useState } from "react";
import axios from "../../services/axios";
import { toast } from "react-hot-toast";
import { RotateCw, XIcon } from "lucide-react";

const TYPE_CONFIG = {
  COMPLAINT: {
    title: "Khiếu nại đơn hàng",
    intro: "Bạn đang gửi khiếu nại cho đơn hàng",
    label: "Lý do khiếu nại",
    placeholder: "Nhập lý do khiếu nại của bạn (ít nhất 10 ký tự)...",
    submitText: "Gửi khiếu nại",
    successText: "Gửi khiếu nại thành công! Chúng tôi sẽ xử lý sớm nhất.",
  },
  RETURN_REQUEST: {
    title: "Yêu cầu trả hàng / hoàn tiền",
    intro: "Bạn đang gửi yêu cầu trả hàng / hoàn tiền cho đơn hàng",
    label: "Lý do trả hàng",
    placeholder: "Nhập lý do muốn trả hàng / hoàn tiền (ít nhất 10 ký tự)...",
    submitText: "Gửi yêu cầu trả hàng",
    successText: "Gửi yêu cầu trả hàng / hoàn tiền thành công!",
  },
};

const OrderComplaintForm = ({
  isOpen,
  onClose,
  orderId,
  orderCode,
  type = "COMPLAINT",
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.COMPLAINT;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast.error("Lý do phải có ít nhất 10 ký tự");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/complaints", { orderId, reason, type });
      toast.success(config.successText);
      onSuccess();
      setReason("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-2.5 px-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{config.title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-200"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="py-2.5 px-4">
          <div className="mb-4 text-sm text-slate-600">
            {config.intro}{" "}
            <span className="font-bold text-slate-800">#{orderCode}</span>.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="reason"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                {config.label} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                placeholder={config.placeholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
              <p className="text-xs text-slate-500 mt-2">
                Càng chi tiết càng giúp chúng tôi xử lý nhanh chóng hơn.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 text-sm">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors "
                disabled={isSubmitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || reason.trim().length < 10}
                className="px-3 py-2 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw size={14} className="animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  config.submitText
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
