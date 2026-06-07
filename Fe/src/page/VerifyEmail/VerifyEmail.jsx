import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as z from "zod";
import axiosInstance from "../../network/httpRequest";

const schema = z.object({
  email: z.string().trim().email("Email không hợp lệ."),
  otp: z.string().trim().regex(/^[0-9]{6}$/, "OTP phải gồm 6 chữ số."),
});

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("form"); // "form" | "success"
  const [submitError, setSubmitError] = useState("");
  const [info, setInfo] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) setValue("email", email);
  }, [searchParams, setValue]);

  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => navigate("/login"), 2000);
    return () => clearTimeout(t);
  }, [navigate, status]);

  const onSubmit = async (data) => {
    try {
      setSubmitError("");
      setInfo("");
      await axiosInstance.post("/auth/verify-otp", {
        email: data.email,
        otp: data.otp,
      });
      setStatus("success");
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."
      );
    }
  };

  const onResend = async () => {
    try {
      setSubmitError("");
      setInfo("");
      const email = searchParams.get("email");
      if (!email) {
        setSubmitError("Vui lòng nhập email để nhận lại OTP.");
        return;
      }
      await axiosInstance.post("/auth/resend-otp", { email });
      setInfo("Đã gửi lại OTP. Vui lòng kiểm tra email (kể cả thư rác).");
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Gửi lại OTP thất bại. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-red-100">
        {status === "success" ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Xác thực OTP thành công!
            </h2>
            <p className="text-gray-600 mb-8">
              Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Tự động chuyển về trang đăng nhập sau <b>2 giây</b>...
            </p>
            <Link
              to="/login"
              className="inline-block bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-10 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
            >
              Đăng nhập ngay
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Xác thực OTP
            </h2>
            <p className="text-gray-600 mb-6">
              Nhập mã OTP 6 số đã được gửi về email của bạn.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 text-left">
              <div>
                <label className="block text-gray-800 font-medium mb-1.5" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
                  placeholder="hello@c-learning.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-600 mt-1 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-800 font-medium mb-1.5" htmlFor="otp">
                  Mã OTP
                </label>
                <input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white tracking-[0.35em] text-center font-semibold"
                  placeholder="••••••"
                  {...register("otp")}
                />
                {errors.otp && (
                  <p className="text-red-600 mt-1 text-sm">{errors.otp.message}</p>
                )}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {submitError}
                </div>
              )}
              {info && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg disabled:opacity-60"
              >
                {isSubmitting ? "Đang xác thực..." : "Xác thực"}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={onResend}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Gửi lại OTP
              </button>
              <Link to="/login" className="text-gray-600 hover:text-gray-800">
                Về đăng nhập
              </Link>
            </div>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} C-learning</span>
          <span>•</span>
          <span className="text-red-500/60">学无止境</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
