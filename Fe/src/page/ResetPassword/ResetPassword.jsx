import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import axiosInstance from "../../network/httpRequest";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function isStrongEnough(pw) {
  if (!pw) return false;
  const okLen = pw.length >= 8;
  const hasLetter = /[A-Za-z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  return okLen && hasLetter && hasNumber;
}

export default function SetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const canSubmit = useMemo(() => {
    if (!token || !email) return false;
    if (!newPassword || !confirm) return false;
    if (newPassword !== confirm) return false;
    if (!isStrongEnough(newPassword)) return false;
    return true;
  }, [token, email, newPassword, confirm]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { token, email, newPassword };
      const { data } = await axiosInstance.post("/users/set-first-password", payload);
      return data;
    },
  });

  // Swal success + redirect to login
  useEffect(() => {
    if (!mutation.isSuccess) return;

    (async () => {
      await Swal.fire({
        icon: "success",
        title: "Đổi mật khẩu thành công!",
        text: "Bạn sẽ được chuyển về trang đăng nhập.",
        timer: 1400,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
      });
      navigate("/login", { replace: true });
    })();
  }, [mutation.isSuccess, navigate]);

  const missingLink = !token || !email;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-b from-red-50 via-white to-red-50">
      {/* soft background */}
      <div className="pointer-events-none fixed inset-0">
        {/* glow blobs */}
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-red-100/50 blur-3xl" />

        {/* subtle stripes */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(185,28,28,0.25) 0, rgba(185,28,28,0.25) 2px, transparent 2px, transparent 56px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* tiny dots */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,1) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="relative w-full max-w-[460px]">
        {/* header chip */}
        <div className="mb-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-red-800">
              C-learning
            </span>
            <span className="h-1 w-1 rounded-full bg-red-400" />
            <span className="text-[11px] font-medium text-slate-600">HSK</span>
          </div>
        </div>

        <div className="relative rounded-3xl border border-red-100 bg-white/80 shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur overflow-hidden">
          {/* corner accent */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-red-100/70" />
          <div className="pointer-events-none absolute -top-5 -right-3 text-[54px] opacity-85 select-none">
            📚
          </div>

          {/* lantern corner */}
          <div className="pointer-events-none absolute -bottom-8 -left-6 text-[58px] opacity-75 select-none">
            🏮
          </div>

          {/* top bar */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold tracking-[0.18em] uppercase text-red-700/80">
                  Thiết lập tài khoản
                </div>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Đổi mật khẩu lần đầu
                </h1>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Đổi mật khẩu xong là vào học HSK liền 🎓
                </p>
              </div>

              {/* mini badge */}
              <div className="shrink-0 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-center">
                <div className="text-[10px] font-bold text-red-800 tracking-widest">
                  HSK
                </div>
                <div className="text-[10px] font-semibold text-red-700">
                  安全
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            {missingLink ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <div className="font-semibold">Link không hợp lệ</div>
                <div className="text-sm mt-1 leading-relaxed">
                  Thiếu <code className="font-mono">token</code> hoặc{" "}
                  <code className="font-mono">email</code>. Bạn hãy mở đúng link
                  được gửi trong email.
                </div>
              </div>
            ) : (
              <>
                {/* email card */}
                <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {email}
                  </div>
                </div>

                <label className="block text-sm font-semibold text-slate-800">
                  Mật khẩu mới
                </label>
                <div className="mt-2 relative">
                  <input
                    type={show ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 8 ký tự, có chữ và số"
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3.5 text-slate-900 placeholder:text-slate-400",
                      "border-slate-200 bg-white",
                      "focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-400"
                    )}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    {show ? "Ẩn" : "Hiện"}
                  </button>
                </div>

                <label className="block text-sm font-semibold text-slate-800 mt-4">
                  Nhập lại mật khẩu
                </label>
                <div className="mt-2">
                  <input
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Nhập lại cho chắc"
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3.5 text-slate-900 placeholder:text-slate-400",
                      "border-slate-200 bg-white",
                      "focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-400"
                    )}
                    autoComplete="new-password"
                  />
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {newPassword && !isStrongEnough(newPassword) && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-red-900">
                      Gợi ý: ≥ 8 ký tự, có chữ + số.
                    </div>
                  )}
                  {confirm && newPassword !== confirm && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                      Mật khẩu nhập lại chưa khớp.
                    </div>
                  )}
                </div>

                {mutation.isError && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-900 text-sm">
                    {mutation.error?.response?.data?.message ||
                      mutation.error?.message ||
                      "Đổi mật khẩu thất bại"}
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canSubmit || mutation.isPending}
                  onClick={() => mutation.mutate()}
                  className={cn(
                    "mt-5 w-full rounded-2xl py-3.5 font-extrabold transition shadow-sm",
                    canSubmit && !mutation.isPending
                      ? "bg-red-700 text-white hover:bg-red-800"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  )}
                >
                  {mutation.isPending ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                </button>

                <div className="mt-4 text-xs text-slate-500 leading-relaxed">
                  Link chỉ dùng 1 lần và sẽ hết hạn. Nếu hết hạn, nhờ admin gửi
                  lại link mới.
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-red-700">加油</span>
                  <span>•</span>
                  <span>Học đều mỗi ngày, HSK lên nhanh</span>
                </div>

                <div className="mt-4 text-center text-sm">
                  <Link
                    to="/login"
                    className="text-red-700 font-semibold hover:underline"
                  >
                    Quay về đăng nhập
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
