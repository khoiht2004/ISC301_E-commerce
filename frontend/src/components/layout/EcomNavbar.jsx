import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { toast } from "react-hot-toast";
import { DASHBOARD_PATHS, ROLES } from "../../constants/roles";
import { ShoppingCart, UserRound } from "lucide-react";

const EcomNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    { name: "Tin tức", path: "/news" },
    { name: "About Us", path: "/about" },
  ];

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    toast.success("Đã đăng xuất");
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md py-2`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6903/6903187.png"
            alt="logo"
            className="w-10 h-10 object-cover"
          />
          <span className={`text-xl font-bold tracking-tight text-slate-90`}>
            Deat Lemi <span className="text-primary-600">Shop</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-medium no-underline transition-colors ${
                location.pathname === link.path
                  ? "text-primary-600"
                  : "text-slate-600 hover:text-primary-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          {/* User Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 p-2 rounded-full transition-colors text-slate-700 hover:bg-slate-100`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserRound />
                )}
                <span className="hidden sm:block text-sm font-medium">
                  {user.fullName.split(" ")[0]}
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center justify-center p-2 rounded-full transition-colors no-underline text-slate-700 hover:bg-slate-100`}
              >
                <UserRound />
              </Link>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-slate-100 overflow-hidden transform origin-top-right transition-all">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.email}
                  </p>
                </div>

                {(user.role === ROLES.ADMIN || user.role === ROLES.STAFF) && (
                  <Link
                    to={DASHBOARD_PATHS.manager}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 no-underline transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {user.role === ROLES.ADMIN ? "Admin Dashboard" : "STAFF Dashboard"}
                  </Link>
                )}

                <Link
                  to="/account"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 no-underline transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Chi tiết tài khoản
                </Link>

                <Link
                  to="/my-orders"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 no-underline transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Đơn hàng của tôi
                </Link>

                <div className="border-t border-slate-100 mt-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 font-medium transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (!user) {
                toast.error("Vui lòng đăng nhập để xem giỏ hàng");
                navigate("/login");
              } else {
                navigate("/cart");
              }
            }}
            className={`relative p-2 rounded-full transition-colors no-underline text-slate-700 hover:bg-slate-100`}
          >
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors text-slate-700 hover:bg-slate-100 rounded-full`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden absolute top-full left-0 right-0 shadow-lg border-t transition-all duration-300 ${
            isScrolled
              ? "bg-white border-slate-100 text-slate-800"
              : "bg-slate-950 border-slate-800 text-white"
          } py-4 px-6 flex flex-col gap-3 z-50`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-medium no-underline py-2 transition-colors ${
                location.pathname === link.path
                  ? "text-primary-600"
                  : isScrolled
                    ? "text-slate-600 hover:text-primary-600"
                    : "text-white/80 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default EcomNavbar;
