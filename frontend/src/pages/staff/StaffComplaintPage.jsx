import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import {
  AlertCircle,
  Mail,
  MessageSquare,
  Phone,
  Search,
  User,
} from "lucide-react";
import StaffPagination from "../../components/staff/StaffPagination";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "RESOLVING", label: "Đang giải quyết" },
  { value: "RESOLVED", label: "Đã giải quyết" },
  { value: "REJECTED", label: "Từ chối" },
];

const StaffComplaintPage = () => {
  const { socket } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolution, setResolution] = useState("");
  const [updateStatus, setUpdateStatus] = useState("RESOLVING");
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/complaints", {
        params: {
          page,
          limit: 10,
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      setComplaints(res.data.data);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.log(err);
      toast.error("Lỗi khi tải khiếu nại");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchComplaints, 300);
    return () => clearTimeout(timeout);
  }, [fetchComplaints]);

  // Reset về trang 1 khi đổi filter/search
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_complaint", (complaint) => {
      toast.success(`Khiếu nại mới từ đơn hàng #${complaint.orderCode}`);
      // Tải lại trang hiện tại để danh sách khớp với filter/phân trang đang xem
      fetchComplaints();
    });

    return () => {
      socket.off("new_complaint");
    };
  }, [socket, fetchComplaints]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSubmitting(true);
    try {
      await api.put(`/complaints/${selectedComplaint.id}/status`, {
        status: updateStatus,
        resolution,
      });
      toast.success("Cập nhật khiếu nại thành công");
      setSelectedComplaint(null);
      setResolution("");
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-md uppercase">
            Chờ xử lý
          </span>
        );
      case "RESOLVING":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-md uppercase">
            Đang giải quyết
          </span>
        );
      case "RESOLVED":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md uppercase">
            Đã giải quyết
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md uppercase">
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Đang tải danh sách khiếu nại...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 flex-1 overflow-y-auto flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Quản lý Khiếu Nại
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Danh sách khiếu nại cho các đơn hàng bạn phụ trách
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 shrink-0">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên/email khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="px-3 py-2 text-center w-12">STT</th>
              <th className="px-3 py-2">Mã ĐH</th>
              <th className="px-3 py-2">Khách hàng</th>
              <th className="px-3 py-2">Lý do</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Ngày tạo</th>
              <th className="px-3 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Không có khiếu nại nào
                </td>
              </tr>
            ) : (
              complaints.map((c, index) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2 text-center text-slate-400 font-semibold">
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td className="px-3 py-2 font-bold text-sm text-slate-700">
                    {c.order?.orderCode || c.orderCode}
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-slate-800 text-sm">
                      {c.user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500">{c.user?.email}</p>
                    {c.user?.phone && (
                      <p className="text-xs text-slate-500">{c.user.phone}</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <p
                      className="text-sm text-slate-700 max-w-xs truncate"
                      title={c.reason}
                    >
                      {c.reason}
                    </p>
                  </td>
                  <td className="px-3 py-2">{getStatusBadge(c.status)}</td>
                  <td className="px-3 py-2 text-sm text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="px-3 py-1.5 bg-primary-50 text-primary-700 font-bold text-xs rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      Xử lý
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <StaffPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <AlertCircle size={18} className="text-primary-600" />
                Xử lý khiếu nại #{selectedComplaint.order?.orderCode}
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1.5"
              >
                &times;
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <div className="mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Khách hàng
                </p>
                <section className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                    <User size={16} />
                    {selectedComplaint.user?.fullName}
                  </p>
                  {selectedComplaint.user?.phone && (
                    <a
                      href={`tel:${selectedComplaint.user.phone}`}
                      className="text-xs text-slate-600 flex items-center gap-1 hover:underline"
                    >
                      <Phone size={16} />
                      {selectedComplaint.user.phone}
                    </a>
                  )}
                  <a
                    href={`mailto:${selectedComplaint.user?.email}`}
                    className="text-xs text-slate-600 flex items-center gap-1 hover:underline"
                  >
                    <Mail size={16} />
                    {selectedComplaint.user?.email}
                  </a>
                </section>
              </div>

              <div className="mb-3 bg-red-50 p-3 rounded-xl border border-red-100 text-red-900">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MessageSquare size={14} /> Lý do khiếu nại
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.reason}
                </p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="RESOLVING">Đang giải quyết</option>
                    <option value="RESOLVED">Đã giải quyết</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Phương án giải quyết (ghi chú)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                    placeholder="Nhập phương án giải quyết để khách hàng xem..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  ></textarea>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-md shadow-primary-600/20 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all flex items-center justify-center disabled:opacity-50 text-sm"
                  >
                    {submitting ? "Đang cập nhật..." : "Cập nhật khiếu nại"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffComplaintPage;
