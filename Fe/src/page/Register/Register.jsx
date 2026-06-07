import { zodResolver } from "@hookform/resolvers/zod";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import axiosInstance from "../../network/httpRequest";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự."),
    email: z.string().trim().email("Email không hợp lệ."),
    phone: z
      .string()
      .trim()
      .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ.")
      .optional()
      .or(z.literal("")),
    password: z.string().trim().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    confirmPassword: z.string().trim().min(1, "Vui lòng xác nhận mật khẩu."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

function CLearningLogo({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="logoGradientReg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B91C1C" />
          <stop offset="50%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
        <linearGradient id="regAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="shadowReg" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
        </filter>
      </defs>
      <rect x="5" y="5" width="110" height="110" rx="30" fill="url(#logoGradientReg)" filter="url(#shadowReg)" />
      <rect x="72" y="5" width="35" height="10" rx="5" fill="url(#regAccentGrad)" opacity="0.9" />
      <text x="40" y="80" textAnchor="middle" fill="white" fontSize="65" fontFamily="'Inter', 'Segoe UI', sans-serif" fontWeight="800" letterSpacing="-2">C</text>
      <line x1="68" y1="38" x2="100" y2="38" stroke="rgba(255,255,255,0.5)" strokeWidth="5" strokeLinecap="round" />
      <line x1="68" y1="54" x2="95" y2="54" stroke="rgba(255,255,255,0.35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="68" y1="70" x2="88" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Lantern({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="20" width="40" height="60" rx="20" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
      <rect x="18" y="15" width="24" height="8" rx="2" fill="#7F1D1D" />
      <rect x="18" y="77" width="24" height="8" rx="2" fill="#7F1D1D" />
      <line x1="30" y1="0" x2="30" y2="15" stroke="#7F1D1D" strokeWidth="3" />
      <line x1="30" y1="85" x2="30" y2="110" stroke="#D97706" strokeWidth="4" />
      <circle cx="30" cy="115" r="4" fill="#D97706" />
      <rect x="18" y="35" width="24" height="3" rx="1.5" fill="#FCA5A5" opacity="0.6" />
      <rect x="18" y="48" width="24" height="3" rx="1.5" fill="#FCA5A5" opacity="0.6" />
      <rect x="18" y="61" width="24" height="3" rx="1.5" fill="#FCA5A5" opacity="0.6" />
      <text x="30" y="55" textAnchor="middle" fill="#FEE2E2" fontSize="16" fontFamily="serif">福</text>
    </svg>
  );
}

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpInfo, setOtpInfo] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      setSubmitError("");
      await axiosInstance.post("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      });
      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      setSubmitError(msg);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-red-100">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Đăng ký thành công!</h2>
          <p className="text-gray-600 mb-2">
            Chúng tôi đã gửi mã OTP tới:
          </p>
          <p className="font-semibold text-red-700 mb-6 break-all">{registeredEmail}</p>
          <p className="text-gray-500 text-sm mb-4">
            Vui lòng kiểm tra hộp thư (kể cả thư rác) và nhập OTP để kích hoạt tài khoản.
            OTP có hiệu lực trong <strong>15 phút</strong>.
          </p>

          <div className="text-left">
            <label className="block text-gray-800 font-medium mb-1.5" htmlFor="otp">
              Mã OTP
            </label>
            <input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white tracking-[0.35em] text-center font-semibold"
            />
          </div>

          {otpError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-3 text-sm">
              {otpError}
            </div>
          )}
          {otpInfo && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mt-3 text-sm">
              {otpInfo}
            </div>
          )}

          <button
            type="button"
            disabled={verifyingOtp}
            onClick={async () => {
              try {
                setOtpError("");
                setOtpInfo("");
                const normalized = otp.trim();
                if (!/^[0-9]{6}$/.test(normalized)) {
                  setOtpError("OTP phải gồm 6 chữ số.");
                  return;
                }
                setVerifyingOtp(true);
                await axiosInstance.post("/auth/verify-otp", {
                  email: registeredEmail,
                  otp: normalized,
                });
                setOtpInfo("Xác thực thành công! Tự động chuyển sang đăng nhập sau 2 giây...");
                setTimeout(() => navigate("/login"), 2000);
              } catch (err) {
                setOtpError(
                  err?.response?.data?.message ||
                    "OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."
                );
              } finally {
                setVerifyingOtp(false);
              }
            }}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg mt-4 disabled:opacity-60"
          >
            {verifyingOtp ? "Đang xác thực..." : "Xác thực OTP"}
          </button>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              disabled={resendingOtp}
              onClick={async () => {
                try {
                  setOtpError("");
                  setOtpInfo("");
                  setResendingOtp(true);
                  await axiosInstance.post("/auth/resend-otp", {
                    email: registeredEmail,
                  });
                  setOtpInfo("Đã gửi lại OTP. Vui lòng kiểm tra email.");
                } catch (err) {
                  setOtpError(
                    err?.response?.data?.message ||
                      "Gửi lại OTP thất bại. Vui lòng thử lại."
                  );
                } finally {
                  setResendingOtp(false);
                }
              }}
              className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-60"
            >
              {resendingOtp ? "Đang gửi..." : "Gửi lại OTP"}
            </button>
            <Link
              to={`/verify-email?email=${encodeURIComponent(registeredEmail)}`}
              className="text-gray-600 hover:text-gray-800"
            >
              Mở trang xác thực
            </Link>
          </div>

          <div className="mt-6">
            <Link
              to="/login"
              className="inline-block w-full text-center bg-white border border-red-200 text-red-700 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all"
            >
              Về trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-red-200/40 to-orange-100/30 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-amber-100/40 to-red-100/30 blur-[100px]" />
      </div>

      <Lantern className="absolute left-6 top-4 h-32 opacity-90 animate-[float_4s_ease-in-out_infinite]" />
      <Lantern className="absolute right-6 top-8 h-28 opacity-80 animate-[float_4s_1.5s_ease-in-out_infinite]" />

      <div className="relative z-10 flex flex-col md:flex-row items-stretch max-w-6xl mx-auto px-6 py-10 md:py-16 min-h-screen md:min-h-0 md:items-center">
        {/* Left: Brand Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#B91C1C] via-[#991B1B] to-[#7F1D1D] text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 border border-white/30 rounded-full" />
            <div className="absolute bottom-8 left-8 w-24 h-24 border border-white/20 rounded-full" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm grid place-items-center text-3xl font-bold shadow-lg">
                C
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold tracking-wide">C-learning</div>
                <div className="text-white/70 text-sm">Nền tảng học tiếng Trung</div>
              </div>
            </div>
            <div className="flex justify-center py-4">
              <CLearningLogo className="w-36 md:w-44 drop-shadow-2xl" />
            </div>
            <div className="mt-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4">Bắt đầu hành trình của bạn</h2>
              <p className="text-white/90 leading-relaxed mb-5">
                Tạo tài khoản miễn phí và khám phá kho học liệu tiếng Trung đồ sộ từ HSK1 đến HSK6.
              </p>
              <ul className="space-y-3 text-white/95">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  <span>Miễn phí hoàn toàn khi đăng ký</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  <span>Xác thực qua email bảo mật</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
                  <span>Học mọi lúc, mọi nơi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Register Form */}
        <div className="md:w-7/12 mt-8 md:mt-0 md:ml-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-red-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-red-700 tracking-wide">C-learning</span>
              <span className="text-xl text-red-600/80">学中文</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">Tạo tài khoản</h1>
          <p className="text-gray-600 mb-6">
            Đăng ký để bắt đầu hành trình chinh phục <b className="text-red-700">HSK</b> cùng C-learning.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Họ tên */}
            <div>
              <label htmlFor="name" className="block text-gray-800 font-medium mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                placeholder="Nguyễn Văn A"
                className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-600 mt-1 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-800 font-medium mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="hello@c-learning.com"
                className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-600 mt-1 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label htmlFor="phone" className="block text-gray-800 font-medium mb-1.5">
                Số điện thoại <span className="text-gray-400 font-normal text-sm">(tuỳ chọn)</span>
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="0912345678"
                className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-red-600 mt-1 text-sm">{errors.phone.message}</p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="password" className="block text-gray-800 font-medium mb-1.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 mt-1 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-800 font-medium mb-1.5">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 mt-1 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-red-600 hover:text-red-700 font-semibold transition-colors">
                Đăng nhập ngay
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

export default Register;
