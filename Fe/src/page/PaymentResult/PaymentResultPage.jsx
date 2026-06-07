import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVerifyZaloPayPayment } from "../../hooks/useOrders";
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  School,
  ArrowForward,
  Home,
} from "@mui/icons-material";

const STATUS_CONFIG = {
  paid: {
    icon: <CheckCircle sx={{ fontSize: 72, color: "#16a34a" }} />,
    title: "Thanh toán thành công!",
    subtitle: "Bạn đã được ghi danh vào lớp học. Chúc bạn học tốt!",
    bg: "linear-gradient(135deg,#f0fdf4,#fff)",
    borderColor: "#bbf7d0",
    titleColor: "#15803d",
    autoRedirect: true,
  },
  failed: {
    icon: <Cancel sx={{ fontSize: 72, color: "#dc2626" }} />,
    title: "Thanh toán thất bại",
    subtitle: "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.",
    bg: "linear-gradient(135deg,#fff7f7,#fff)",
    borderColor: "#fecaca",
    titleColor: "#b91c1c",
    autoRedirect: false,
  },
  pending: {
    icon: <HourglassEmpty sx={{ fontSize: 72, color: "#f59e0b" }} />,
    title: "Đang xử lý...",
    subtitle: "Giao dịch đang được xác nhận. Vui lòng chờ trong giây lát.",
    bg: "linear-gradient(135deg,#fffbeb,#fff)",
    borderColor: "#fde68a",
    titleColor: "#b45309",
    autoRedirect: false,
  },
};

export default function PaymentResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const appTransId =
    searchParams.get("apptransid") || searchParams.get("appTransId") || null;
  const orderId = searchParams.get("orderId") || null;

  const { data, isLoading, isError, error } = useVerifyZaloPayPayment({
    appTransId,
    orderId,
    enabled: Boolean(appTransId || orderId),
  });

  const status = data?.status || "pending";
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  // Tự redirect sang lớp của tôi sau 4s khi paid
  useEffect(() => {
    if (cfg.autoRedirect) {
      const t = setTimeout(() => navigate("/my-classes", { replace: true }), 4000);
      return () => clearTimeout(t);
    }
  }, [cfg.autoRedirect, navigate]);

  return (
    <div style={{
      minHeight: "100vh", width: "100%", flex: 1,
      background: isLoading ? "linear-gradient(135deg,#f9fafb,#fff)" : cfg.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", transition: "background 0.4s",
    }}>
      <div style={{ maxWidth: 480, width: "100%" }}>

        {/* Loading */}
        {isLoading && (
          <div style={{
            background: "#fff", borderRadius: 24, padding: "48px 32px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)", border: "1.5px solid #f3f4f6",
            textAlign: "center",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
              border: "4px solid #e5e7eb", borderTopColor: "#b91c1c",
              animation: "spin 1s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", marginBottom: 8 }}>
              Đang xác minh giao dịch
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 15, margin: 0 }}>
              Vui lòng chờ trong giây lát...
            </p>
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div style={{
            background: "#fff", borderRadius: 24, padding: "48px 32px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)", border: "1.5px solid #fecaca",
            textAlign: "center",
          }}>
            <Cancel sx={{ fontSize: 72, color: "#dc2626", marginBottom: "12px" }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#b91c1c", marginBottom: 8 }}>
              Không thể xác minh giao dịch
            </h2>
            <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 28 }}>
              {error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => navigate("/courses")}
                style={btnStyle("#fff", "#6b7280", "1.5px solid #e5e7eb")}
              >
                <Home fontSize="small" style={{ marginRight: 6 }} />
                Về khóa học
              </button>
              <button
                onClick={() => window.location.reload()}
                style={btnStyle("linear-gradient(135deg,#b91c1c,#dc2626)", "#fff", "none")}
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {!isLoading && !isError && (
          <div style={{
            background: "#fff", borderRadius: 24, overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)", border: `1.5px solid ${cfg.borderColor}`,
          }}>
            {/* Top accent */}
            <div style={{
              height: 6,
              background: status === "paid"
                ? "linear-gradient(90deg,#16a34a,#22c55e)"
                : status === "failed"
                ? "linear-gradient(90deg,#b91c1c,#dc2626)"
                : "linear-gradient(90deg,#d97706,#f59e0b)",
            }} />

            <div style={{ padding: "40px 32px", textAlign: "center" }}>
              <div style={{ marginBottom: 16 }}>{cfg.icon}</div>

              <h1 style={{ fontSize: 24, fontWeight: 900, color: cfg.titleColor, margin: "0 0 8px" }}>
                {cfg.title}
              </h1>
              <p style={{ color: "#6b7280", fontSize: 15, margin: "0 0 28px", lineHeight: 1.6 }}>
                {cfg.subtitle}
              </p>

              {/* Info */}
              <div style={{
                background: "#f9fafb", borderRadius: 14, padding: "16px 20px",
                border: "1px solid #f3f4f6", textAlign: "left", marginBottom: 28,
              }}>
                {[
                  data?.appTransId && ["Mã giao dịch ZaloPay", data.appTransId],
                  (data?.orderId || orderId) && ["Mã đơn hàng", data?.orderId || orderId],
                  data?.paidAt && ["Thời gian thanh toán", new Date(data.paidAt).toLocaleString("vi-VN")],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "6px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14,
                  }}>
                    <span style={{ color: "#9ca3af", fontWeight: 600 }}>{label}</span>
                    <span style={{ color: "#1a1a1a", fontWeight: 700, maxWidth: 220, textAlign: "right", wordBreak: "break-all" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {status === "paid" && (
                <p style={{ fontSize: 13, color: "#16a34a", marginBottom: 20, fontWeight: 600 }}>
                  Tự động chuyển đến lớp học sau 4 giây...
                </p>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/courses")}
                  style={btnStyle("#fff", "#6b7280", "1.5px solid #e5e7eb")}
                >
                  <Home fontSize="small" style={{ marginRight: 6 }} />
                  Về khóa học
                </button>
                <button
                  onClick={() => navigate("/my-classes")}
                  style={btnStyle(
                    status === "paid"
                      ? "linear-gradient(135deg,#15803d,#16a34a)"
                      : "linear-gradient(135deg,#b91c1c,#dc2626)",
                    "#fff",
                    "none"
                  )}
                >
                  <School fontSize="small" style={{ marginRight: 6 }} />
                  Lớp của tôi
                  <ArrowForward fontSize="small" style={{ marginLeft: 4 }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(background, color, border) {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "12px 22px", borderRadius: 12, border,
    background, color, fontWeight: 700, fontSize: 14,
    cursor: "pointer", transition: "all 0.2s",
  };
}
