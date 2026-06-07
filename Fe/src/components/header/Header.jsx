import { useState } from "react";
import { Link } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import useAuthStore from "../../store/useAuthStore";
import MenuHeader from "../menu-header/MenuHeader";
import NotificationBell from "../notification/NotificationBell";

function Header() {
  const { user, token, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = !!user || !!token;
  const displayName = user?.name ?? user?.email ?? "Tài khoản";

  const onSignOut = () => {
    logout();
    window.location.replace("/login");
  };

  return (
    <header className="sticky top-0 left-0 w-full bg-white/95 backdrop-blur-md border-b border-red-100 shadow-sm z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-wide"
          >
            {/* C-learning Logo */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B91C1C" />
                  <stop offset="50%" stopColor="#991B1B" />
                  <stop offset="100%" stopColor="#7F1D1D" />
                </linearGradient>
                <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              {/* Rounded square background */}
              <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGradient)" />
              {/* Decorative corner accent */}
              <rect x="30" y="2" width="14" height="4" rx="2" fill="url(#accentGrad)" opacity="0.9" />
              {/* Letter C */}
              <text x="16" y="33" textAnchor="middle" fill="white" fontSize="26" fontFamily="'Inter', 'Segoe UI', sans-serif" fontWeight="800" letterSpacing="-1">C</text>
              {/* Stylized book/page lines */}
              <line x1="28" y1="16" x2="40" y2="16" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
              <line x1="28" y1="22" x2="38" y2="22" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
              <line x1="28" y1="28" x2="36" y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-red-800 leading-none text-xl font-bold tracking-tight">C-learning</span>
              <span className="text-[10px] text-stone-500 font-normal tracking-wider leading-tight">Nền tảng học tiếng Trung</span>
            </div>
          </Link>
        </div>

        <MenuHeader />

        {/* User Section */}
        <div className="flex items-center gap-4 relative">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 relative">
              <NotificationBell />

              {/* Avatar */}
              <button
                className="w-10 h-10 rounded-full border border-red-200 bg-red-50 shadow-sm overflow-hidden focus:ring-2 focus:ring-red-300 transition-all"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-red-800 font-semibold">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {isMenuOpen && (
                <div className="absolute top-12 right-0 bg-white text-stone-900 shadow-lg rounded-xl w-52 py-2 border border-red-100 animate-[fadeIn_0.2s_ease-in]">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <PersonIcon fontSize="small" className="text-red-700" />
                    Thông tin cá nhân
                  </Link>
                  <button
                    onClick={onSignOut}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm w-full text-left rounded-md"
                  >
                    <LogoutIcon fontSize="small" className="text-red-700" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-red-800 text-white px-5 py-2 rounded-full font-semibold hover:bg-red-900 transition shadow-md hover:shadow-lg"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Dải trang trí dưới header */}
      <div className="h-[3px] w-full bg-gradient-to-r from-red-200 via-red-700 to-red-200" />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}

export default Header;
