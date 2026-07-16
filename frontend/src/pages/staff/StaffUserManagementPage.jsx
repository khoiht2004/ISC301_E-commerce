import { useState, useEffect, useCallback } from "react";
import api from "../../services/axios";
import { toast } from "react-hot-toast";
import { Search, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ROLE_OPTIONS = ["ADMIN", "STAFF", "USER"];

const StaffUserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", {
        params: {
          search: search || undefined,
          role: roleFilter || undefined,
          limit: 50,
        },
      });
      setUsers(data.data);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      toast.success("Cập nhật vai trò thành công");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    if (
      isActive &&
      !window.confirm(
        "Khóa tài khoản này? Người dùng sẽ không thể đăng nhập hoặc tiếp tục phiên hiện tại.",
      )
    )
      return;
    try {
      const { data } = await api.patch(`/admin/users/${id}/status`);
      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("Đã xóa người dùng");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="p-8 bg-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Quản Lý Người Dùng
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý vai trò, trạng thái tài khoản trong hệ thống
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Làm mới
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
        >
          <option value="">Tất cả vai trò</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3 py-2">Thông tin</th>
                <th className="px-3 py-2 text-center">Vai trò</th>
                <th className="px-3 py-2 text-center">Trạng thái</th>
                <th className="px-3 py-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-extrabold text-sm shrink-0">
                            {u.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {u.fullName}
                              {isSelf && (
                                <span className="ml-1.5 text-[10px] font-bold text-primary-600">
                                  (Bạn)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
                          title={
                            isSelf
                              ? "Không thể tự đổi vai trò của chính mình"
                              : undefined
                          }
                          className="text-xs font-bold border-0 rounded-lg px-2 py-1 bg-slate-100 text-slate-700 focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.isActive)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "Không thể tự khóa tài khoản của chính mình"
                              : undefined
                          }
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            u.isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                          />
                          {u.isActive ? "Đang hoạt động" : "Đã khóa"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "Không thể tự xóa tài khoản của chính mình"
                              : "Xóa người dùng"
                          }
                          className="p-2 text-slate-400 hover:text-primary-600 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffUserManagementPage;
