import { Link } from "react-router-dom";
import { useTeacherClasses } from "../../hooks/useClasses";
import dayjs from "dayjs";
import {
  ArrowForward,
  BarChart,
  Event,
  Flag,
  Groups,
  ImageNotSupported,
  School,
} from "@mui/icons-material";
import { getCourseImageSrc, hasCourseImage } from "@/utils/courseMedia";

const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatSchedule(schedule = []) {
  return schedule.map((s) => `${DAY_NAMES[s.dayOfWeek]} ${s.startTime}–${s.endTime}`).join(" | ");
}

const STATUS_CONFIG = {
  open: { label: "Đang mở ĐK", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
  closed: { label: "Đã đóng ĐK", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  ongoing: { label: "Đang diễn ra", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  finished: { label: "Đã kết thúc", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
};

export default function TeacherClassesPage() {
  const { data: classes = [], isLoading } = useTeacherClasses();

  return (
    <div style={{ minHeight: "100vh", width: "100%", flex: 1, background: "linear-gradient(135deg,#fff7f7 0%,#fff 60%,#f0f4ff 100%)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "linear-gradient(135deg,#b91c1c,#dc2626)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(185,28,28,0.3)"
            }}>
              <School style={{ fontSize: 22, color: "#fff" }} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
                Lớp học phụ trách
              </h1>
              <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                Quản lý và theo dõi các lớp bạn đang dạy
              </p>
            </div>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8,
            background: "rgba(185,28,28,0.06)", borderRadius: 999,
            padding: "6px 16px", fontSize: 14, fontWeight: 600, color: "#b91c1c"
          }}>
            <BarChart fontSize="small" />
            <span>{classes.length} lớp đang phụ trách</span>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 140, borderRadius: 20, background: "#f3f4f6",
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
          </div>
        )}

        {/* Empty */}
        {!isLoading && classes.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "#fff", borderRadius: 24,
            border: "2px dashed #fecaca"
          }}>
            <School style={{ fontSize: 64, marginBottom: 16, color: "#b91c1c" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
              Chưa có lớp học nào
            </h3>
            <p style={{ color: "#6b7280", fontSize: 15 }}>
              Liên hệ quản trị viên để được phân công lớp dạy.
            </p>
          </div>
        )}

        {/* Classes Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {classes.map((cls) => {
            const cfg = STATUS_CONFIG[cls.status] || STATUS_CONFIG.closed;
            const fillPercent = cls.maxStudents > 0
              ? Math.round((cls.enrolledCount / cls.maxStudents) * 100)
              : 0;

            return (
              <Link
                key={cls._id}
                to={`/class/${cls._id}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1.5px solid #f3f4f6",
                  padding: "24px 28px",
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(185,28,28,0.12)";
                    e.currentTarget.style.borderColor = "#fecaca";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    e.currentTarget.style.borderColor = "#f3f4f6";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          flexShrink: 0,
                          borderRadius: 14,
                          overflow: "hidden",
                          background: "#f9fafb",
                          border: "1px solid #f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {hasCourseImage(cls.course) ? (
                          <img
                            src={getCourseImageSrc(cls.course)}
                            alt={cls.course?.title || cls.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/1/1c/HSK-logo.jpg";
                            }}
                          />
                        ) : (
                          <ImageNotSupported style={{ color: "#9ca3af" }} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Course + Status badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                          {cls.course?.targetLevel && (
                            <span style={{
                              padding: "3px 10px", borderRadius: 999,
                              background: "rgba(185,28,28,0.08)", color: "#b91c1c",
                              fontSize: 12, fontWeight: 700
                            }}>
                              {cls.course.targetLevel}
                            </span>
                          )}
                          <span style={{
                            padding: "3px 10px", borderRadius: 999,
                            background: cfg.bg, color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            fontSize: 12, fontWeight: 600
                          }}>
                            {cfg.label}
                          </span>
                        </div>

                        {/* Class name */}
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", margin: "0 0 4px 0" }}>
                          {cls.name}
                        </h3>
                        {cls.course?.title && (
                          <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 12px 0" }}>
                            {cls.course.title}
                          </p>
                        )}

                        {/* Info row */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#6b7280" }}>
                          {cls.schedule?.length > 0 && (
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Event fontSize="inherit" /> {formatSchedule(cls.schedule)}
                            </span>
                          )}
                          {cls.startDate && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Event fontSize="inherit" /> {dayjs(cls.startDate).format("DD/MM/YYYY")}
                            </span>
                          )}
                          {cls.endDate && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Flag fontSize="inherit" /> {dayjs(cls.endDate).format("DD/MM/YYYY")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side — stats */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "#b91c1c" }}>
                          {cls.enrolledCount}
                          <span style={{ fontSize: 16, color: "#9ca3af", fontWeight: 500 }}>
                            /{cls.maxStudents}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Groups fontSize="inherit" /> HỌC VIÊN
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ width: 80 }}>
                        <div style={{ height: 6, borderRadius: 3, background: "#f3f4f6", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 3,
                            background: fillPercent >= 90 ? "#ef4444" : fillPercent >= 60 ? "#f59e0b" : "#22c55e",
                            width: `${fillPercent}%`,
                            transition: "width 0.5s ease"
                          }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "right", marginTop: 2 }}>
                          {fillPercent}% đã đăng ký
                        </div>
                      </div>

                      <div style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 13, fontWeight: 700, color: "#b91c1c"
                      }}>
                        Vào lớp <ArrowForward fontSize="small" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
