import { zodResolver } from "@hookform/resolvers/zod";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import * as z from "zod";
import useAuthStore from "../../store/useAuthStore";
import axiosInstance from "../../network/httpRequest";

/* =============== Validation =============== */
const loginSchema = z.object({
  email: z.string().trim().min(4, "Email không hợp lệ.").email("Email không hợp lệ."),
  password: z.string().trim().min(4, "Mật khẩu không hợp lệ."),
});

/* =============== C-learning Logo & Decor SVG =============== */
function CLearningLogo({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="logoGradientLogin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B91C1C" />
          <stop offset="50%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="loginAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Rounded square with shadow */}
      <rect x="5" y="5" width="110" height="110" rx="30" fill="url(#logoGradientLogin)" filter="url(#shadow)" />
      {/* Corner accent bar */}
      <rect x="72" y="5" width="35" height="10" rx="5" fill="url(#loginAccentGrad)" opacity="0.9" />
      {/* Letter C */}
      <text x="40" y="80" textAnchor="middle" fill="white" fontSize="65" fontFamily="'Inter', 'Segoe UI', sans-serif" fontWeight="800" letterSpacing="-2">C</text>
      {/* Stylized book/knowledge lines */}
      <line x1="68" y1="38" x2="100" y2="38" stroke="rgba(255,255,255,0.5)" strokeWidth="5" strokeLinecap="round" />
      <line x1="68" y1="54" x2="95" y2="54" stroke="rgba(255,255,255,0.35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="68" y1="70" x2="88" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Lantern({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Main lantern body - Chinese Red */}
      <rect x="10" y="20" width="40" height="60" rx="20" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
      {/* Top and bottom connectors */}
      <rect x="18" y="15" width="24" height="8" rx="2" fill="#7F1D1D" />
      <rect x="18" y="77" width="24" height="8" rx="2" fill="#7F1D1D" />
      {/* Hanging rope */}
      <line x1="30" y1="0" x2="30" y2="15" stroke="#7F1D1D" strokeWidth="3" />
      {/* Tassel */}
      <line x1="30" y1="85" x2="30" y2="110" stroke="#D97706" strokeWidth="4" />
      <circle cx="30" cy="115" r="4" fill="#D97706" />
      {/* Decorative lines on lantern */}
      <rect x="18" y="35" width="24" height="3" rx="1.5" fill="#FCA5A5" opacity="0.6" />
      <rect x="18" y="48" width="24" height="3" rx="1.5" fill="#FCA5A5" opacity="0.6" />
      <rect x="18" y="61" width="24" height="3" rx="1.5" fill="#FCA5A5" opacity="0.6" />
      {/* 福 character hint */}
      <text x="30" y="55" textAnchor="middle" fill="#FEE2E2" fontSize="16" fontFamily="serif">福</text>
    </svg>
  );
}

function ChineseCloud({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M20 60 Q30 40 50 50 Q60 30 80 40 Q100 20 120 40 Q140 30 160 50 Q180 40 190 60 Q180 80 100 80 Q20 80 20 60Z"
        fill="#FEE2E2"
        opacity="0.6"
      />
    </svg>
  );
}

function ChinesePattern({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Traditional Chinese window pattern */}
      <rect x="10" y="10" width="80" height="80" fill="none" stroke="#B91C1C" strokeWidth="2" opacity="0.2" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="#B91C1C" strokeWidth="1.5" opacity="0.15" />
      <line x1="10" y1="50" x2="90" y2="50" stroke="#B91C1C" strokeWidth="1.5" opacity="0.15" />
      <rect x="25" y="25" width="50" height="50" fill="none" stroke="#B91C1C" strokeWidth="1" opacity="0.1" />
    </svg>
  );
}

/* =============== Component =============== */
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const authenticate = async (data) => {
    try {
      const res = await axiosInstance.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      const ok = res.status === 200;
      const token =
        res.data?.access_token ??
        res.data?.token ??
        res.data?.data?.token ??
        res.data?.data?.access_token;
      const user = res.data?.user ?? res.data?.data?.user;
      if (!ok || !token || !user) throw new Error("Invalid login response");

      login(user, token);

      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "teacher":
          navigate("/manage-document");
          break;
        default:
          navigate("/");
      }
      setLoginError("");
    } catch (error) {
      console.error("Login failed:", error?.response?.data || error.message);
      const msg =
        error?.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
      setLoginError(msg);
    }
  };

  const onSubmit = async (data) => {
    await authenticate(data);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Gradient orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-red-200/40 to-orange-100/30 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-amber-100/40 to-red-100/30 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-red-100/30 to-transparent blur-2xl" />

        {/* Chinese patterns */}
        <ChinesePattern className="absolute top-20 left-10 w-24 h-24 opacity-30" />
        <ChinesePattern className="absolute bottom-32 right-16 w-32 h-32 opacity-20" />

        {/* Clouds */}
        <ChineseCloud className="absolute top-10 right-1/4 w-40 opacity-50" />
        <ChineseCloud className="absolute bottom-20 left-10 w-32 opacity-40" />
      </div>

      {/* Đèn lồng đỏ */}
      <Lantern className="absolute left-6 top-4 h-32 opacity-90 animate-[float_4s_ease-in-out_infinite]" />
      <Lantern className="absolute right-6 top-8 h-28 opacity-80 animate-[float_4s_1.5s_ease-in-out_infinite]" />
      <Lantern className="absolute left-1/4 top-2 h-20 opacity-60 animate-[float_4s_0.5s_ease-in-out_infinite] hidden md:block" />

      <div className="relative z-10 flex flex-col md:flex-row items-stretch max-w-6xl mx-auto px-6 py-10 md:py-16 min-h-screen md:min-h-0 md:items-center">
        {/* Left: Brand Panel (Chinese Red) */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#B91C1C] via-[#991B1B] to-[#7F1D1D] text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 border border-white/30 rounded-full" />
            <div className="absolute bottom-8 left-8 w-24 h-24 border border-white/20 rounded-full" />
            <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-white/20 rounded-full" />
          </div>

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm grid place-items-center text-3xl font-bold shadow-lg">
                C
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold tracking-wide">C-learning</div>
                <div className="text-white/70 text-sm">Nền tảng học tiếng Trung</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Main Logo Display */}
              <div className="flex justify-center py-4">
                <CLearningLogo className="w-40 md:w-48 drop-shadow-2xl" />
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-4">Hành trình chinh phục Hán tự</h2>
                <p className="text-white/90 leading-relaxed mb-6">
                  Học <b>tiếng Trung</b> theo lộ trình HSK1 → HSK6, luyện phát âm chuẩn,
                  từ vựng có ví dụ <i>(汉字 / Pinyin / Việt)</i>,
                  cùng phương pháp học hiện đại.
                </p>
                <ul className="space-y-3 text-white/95">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                    <span>5,000+ bài học HSK theo chủ đề</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                    <span>Phát âm chuẩn giọng Bắc Kinh</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                    <span>Flashcard thông minh & bài thi thử</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="md:w-1/2 mt-8 md:mt-0 md:ml-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-red-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-red-700 tracking-wide">C-learning</span>
              <span className="text-xl text-red-600/80">学中文</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Đăng nhập</h1>
          <p className="text-gray-600 mb-8">
            Chào mừng bạn quay lại! Tiếp tục hành trình chinh phục <b className="text-red-700">HSK</b> cùng C-learning.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-gray-800 font-medium mb-2">
                Email hoặc tên đăng nhập
              </label>
              <input
                type="text"
                id="email"
                placeholder="ví dụ: hello@c-learning.com"
                className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                {...register("email")}
              />
              {errors.email && (
                <div className="text-red-600 mt-1.5 text-sm">{errors.email.message}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-800 font-medium mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
              {errors.password && (
                <div className="text-red-600 mt-1.5 text-sm">{errors.password.message}</div>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <Link to="/forgot-password" className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-red-600 hover:text-red-700 font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} C-learning</span>
            <span>•</span>
            <span className="text-red-600/70">学无止境</span>
          </div>
        </div>
      </div>

      {/* animation keyframes */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;
