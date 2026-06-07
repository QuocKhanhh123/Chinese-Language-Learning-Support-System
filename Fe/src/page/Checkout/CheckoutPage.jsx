import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useCreateOrder } from "../../hooks/useOrders";
import {
  SentimentDissatisfied,
  Assignment,
  School,
  EventNote,
  Event,
  AccessTime,
  CardGiftcard,
  Payment,
  InfoOutlined,
  HourglassEmpty,
  Celebration,
  ArrowBack
} from "@mui/icons-material";

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const [processing, setProcessing] = useState(false);

  if (!state?.classId) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", flex: 1,
        background: "linear-gradient(135deg,#fff7f7,#fff)"
      }}>
        <div style={{
          textAlign: "center", maxWidth: 400, margin: "0 20px",
          background: "#fff", borderRadius: 24, padding: 40,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)", border: "1.5px solid #f3f4f6"
        }}>
          <div style={{ marginBottom: 16 }}><SentimentDissatisfied sx={{ fontSize: 48, color: '#9ca3af' }} /></div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", marginBottom: 8 }}>
            Không tìm thấy thông tin đăng ký
          </h2>
          <p style={{ color: "#9ca3af", fontSize: 15, marginBottom: 24 }}>
            Vui lòng chọn lớp học từ trang khóa học.
          </p>
          <button
            onClick={() => navigate("/courses")}
            style={{
              padding: "12px 28px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#b91c1c,#dc2626)",
              color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(185,28,28,0.3)"
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowBack fontSize="small" /> Về danh sách khóa học</span>
          </button>
        </div>
      </div>
    );
  }

  const { classId, className, courseName, courseLevel, teacher, schedule, startDate, deadline, price } = state;

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const result = await createOrder.mutateAsync(classId);
      const paymentUrl = result?.data?.paymentUrl;

      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }

      if (result?.data?.status === "paid") {
        toast.success("🎉 Đăng ký thành công!");
        navigate("/my-classes", { replace: true });
        return;
      }

      toast.info("Đơn đã được tạo. Vui lòng kiểm tra lại trạng thái thanh toán.");
      setProcessing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đăng ký thất bại");
      setProcessing(false);
    }
  };

  const isFree = !price || price <= 0;

  return (
    <div style={{
      minHeight: "100vh", width: "100%", flex: 1,
      background: "linear-gradient(135deg,#fff7f7 0%,#fff 60%,#f0f4ff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px"
    }}>
      <div style={{ maxWidth: 520, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: "0 auto 14px",
            background: "linear-gradient(135deg,#b91c1c,#dc2626)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 6px 20px rgba(185,28,28,0.3)"
          }}>
            <Assignment sx={{ fontSize: 32, color: "#fff" }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1a1a1a", margin: "0 0 6px 0" }}>
            Xác nhận đăng ký lớp học
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 15, margin: 0 }}>
            Kiểm tra thông tin trước khi thanh toán
          </p>
        </div>

        {/* Order card */}
        <div style={{
          background: "#fff", borderRadius: 24, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)", border: "1.5px solid #f3f4f6",
          marginBottom: 20
        }}>
          {/* Card header */}
          <div style={{
            padding: "18px 28px",
            background: "linear-gradient(135deg,#7f1d1d,#b91c1c,#dc2626)",
            color: "#fff"
          }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>ĐĂNG KÝ LỚP HỌC</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{className}</div>
            {courseName && (
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>
                {courseName} {courseLevel && `· ${courseLevel}`}
              </div>
            )}
          </div>

          <div style={{ padding: "24px 28px" }}>
            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {[
                teacher && { icon: <School fontSize="inherit" />, label: "Giáo viên", value: teacher },
                schedule && { icon: <EventNote fontSize="inherit" />, label: "Lịch học", value: schedule },
                startDate && { icon: <Event fontSize="inherit" />, label: "Khai giảng", value: dayjs(startDate).format("DD/MM/YYYY") },
                deadline && { icon: <AccessTime fontSize="inherit" />, label: "Hạn đăng ký", value: dayjs(deadline).format("DD/MM/YYYY") },
              ].filter(Boolean).map((item) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 16px", borderRadius: 12,
                  background: "#f9fafb", border: "1px solid #f3f4f6"
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1.5px dashed #e5e7eb", marginBottom: 20 }} />

            {/* Price */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderRadius: 16,
              background: isFree ? "rgba(22,163,74,0.06)" : "rgba(185,28,28,0.05)",
              border: `1.5px solid ${isFree ? "#bbf7d0" : "#fecaca"}`
            }}>
              <div>
                <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                  Học phí
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: isFree ? "#16a34a" : "#b91c1c" }}>
                  {isFree ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CardGiftcard fontSize="inherit" /> Miễn phí</span> : `${price.toLocaleString("vi-VN")} ₫`}
                </div>
              </div>
              {!isFree && (
                <div style={{
                  padding: "8px 16px", borderRadius: 10,
                  background: "rgba(185,28,28,0.08)", color: "#b91c1c",
                  fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 6
                }}>
                  <Payment fontSize="small" /> Thanh toán ZaloPay
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note */}
        {!isFree && (
          <div style={{
            display: "flex", gap: 10, padding: "12px 16px", borderRadius: 12,
            background: "rgba(245,158,11,0.08)", border: "1px solid #fde68a",
            marginBottom: 20
          }}>
            <span style={{ fontSize: 18, display: 'flex', alignItems: 'center' }}><InfoOutlined fontSize="inherit" style={{ color: '#f59e0b' }} /></span>
            <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
              Bạn sẽ được chuyển tới cổng thanh toán <strong>ZaloPay</strong> để hoàn tất giao dịch. 
              Sau khi thanh toán thành công, bạn sẽ được tự động ghi danh vào lớp.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              flex: 1, padding: "14px 0", borderRadius: 14, border: "1.5px solid #e5e7eb",
              background: "#fff", color: "#6b7280", fontWeight: 700, fontSize: 15,
              cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.background = "#f9fafb"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#fff"; }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowBack fontSize="small" /> Quay lại</span>
          </button>
          <button
            onClick={handlePayment}
            disabled={processing}
            style={{
              flex: 2, padding: "14px 0", borderRadius: 14, border: "none",
              background: processing ? "#e5e7eb" : "linear-gradient(135deg,#b91c1c,#dc2626)",
              color: processing ? "#9ca3af" : "#fff",
              fontWeight: 800, fontSize: 15, cursor: processing ? "wait" : "pointer",
              boxShadow: processing ? "none" : "0 6px 20px rgba(185,28,28,0.3)",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { if (!processing) e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {processing
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><HourglassEmpty fontSize="small" /> Đang xử lý...</span>
              : isFree
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Celebration fontSize="small" /> Đăng ký miễn phí</span>
              : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Payment fontSize="small" /> Thanh toán ngay</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
