import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Send,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../services/axios";
import { DASHBOARD_PATHS, ROLES } from "../constants/roles";

const LoginPage = () => {
  const [email, setEmail] = useState("staff@meatshop.vn");
  const [password, setPassword] = useState("pass123456");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      setSuccessMsg(
        "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.",
      );
      toast.success("Xác thực email thành công!");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get("error") === "invalid_token") {
      setError("Token xác thực không hợp lệ hoặc đã hết hạn.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === ROLES.ADMIN || user.role === ROLES.STAFF)
        navigate(DASHBOARD_PATHS.manager);
      else navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerify = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email của bạn ở trên để gửi lại mã.");
      return;
    }

    setIsResending(true);
    try {
      await api.post("/auth/resend-verification", { email });
      toast.success(
        "Đã gửi lại email xác thực. Vui lòng kiểm tra hòm thư của bạn.",
      );
      setSuccessMsg(
        "Đã gửi lại email xác thực. Vui lòng kiểm tra hòm thư của bạn.",
      );
      setError("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi lại email thất bại.");
    } finally {
      setIsResending(false);
    }
  };

  const handleShowPassword = (e) => {
    e.preventDefault();
    const button = e.currentTarget;
    const input = button.previousElementSibling;
    if (input.type === "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Chào mừng trở lại
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Đăng nhập để quản lý đơn hàng và nhận hỗ trợ 🥩
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-md flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="text-primary-500 shrink-0 mt-0.5"
                  size={18}
                />
                <p className="text-sm text-primary-700 font-medium">{error}</p>
              </div>

              {error === "Please verify your email before logging in" && (
                <button
                  type="button"
                  onClick={handleResendVerify}
                  disabled={isResending}
                  className="mt-2 ml-7 flex items-center justify-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 text-sm font-semibold rounded-lg transition-colors w-fit disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  Gửi lại mail xác thực
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
              <CheckCircle2
                className="text-green-500 shrink-0 mt-0.5"
                size={18}
              />
              <p className="text-sm text-green-700 font-medium">{successMsg}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200 outline-none"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200 outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    onClick={handleShowPassword}
                    type="button"
                    className="absolute right-3 top-3 translate-y-1/2 text-gray-400 hover:text-gray-500"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 cursor-pointer"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary-600 hover:text-primary-500 transition duration-150"
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-primary-200"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "ĐĂNG NHẬP NGAY"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-bold text-primary-700 hover:text-primary-800 underline transition duration-150"
            >
              Đăng ký tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
