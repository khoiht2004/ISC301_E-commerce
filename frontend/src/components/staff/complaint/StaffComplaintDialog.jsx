/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { AlertCircle, Mail, MessageSquare, Phone, User } from "lucide-react";

export const COMPLAINT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "RESOLVING", label: "Đang giải quyết" },
  { value: "RESOLVED", label: "Đã giải quyết" },
  { value: "REJECTED", label: "Từ chối" },
];

const getTypeBadge = (type) =>
  type === "RETURN_REQUEST" ? (
    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-full uppercase">
      Trả hàng / Hoàn tiền
    </span>
  ) : (
    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full uppercase">
      Khiếu nại
    </span>
  );

// Dialog xử lý 1 khiếu nại/yêu cầu trả hàng - tự quản lý state form bên trong,
// chỉ cần truyền `complaint` (null để ẩn), `onClose`, `onSubmit(status, resolution)`.
const StaffComplaintDialog = ({ complaint, onClose, onSubmit, submitting }) => {
  const [status, setStatus] = useState("RESOLVING");
  const [resolution, setResolution] = useState("");

  // Reset form mỗi khi mở dialog cho 1 khiếu nại khác
  useEffect(() => {
    if (complaint) {
      setStatus(
        complaint.status === "PENDING" ? "RESOLVING" : complaint.status,
      );
      setResolution(complaint.resolution || "");
    }
  }, [complaint]);

  if (!complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(status, resolution);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="text-primary-600" />#
            {complaint.order?.orderCode}
            {getTypeBadge(complaint.type)}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
          >
            &times;
          </button>
        </div>

        <div className="p-3.5 overflow-y-auto space-y-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User size={13} /> {complaint.user?.fullName}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {complaint.user?.phone && (
                <a
                  href={`tel:${complaint.user.phone}`}
                  className="text-xs text-slate-600 flex items-center gap-1 hover:underline"
                >
                  <Phone size={13} />
                  {complaint.user.phone}
                </a>
              )}
              <a
                href={`mailto:${complaint.user?.email}`}
                className="text-xs text-slate-600 flex items-center gap-1 hover:underline"
              >
                <Mail size={13} />
                {complaint.user?.email}
              </a>
            </div>
          </div>

          <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-red-900">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MessageSquare size={13} /> Lý do
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {complaint.reason}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Trạng thái
              </label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {COMPLAINT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phương án giải quyết (ghi chú)
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                placeholder="Nhập phương án giải quyết để khách hàng xem..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3.5 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-md shadow-primary-600/20 hover:bg-primary-700 transition-all disabled:opacity-50 text-sm"
              >
                {submitting ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffComplaintDialog;
