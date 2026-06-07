import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyClasses } from "../../hooks/useClasses";
import { useMyQuizResults } from "../../hooks/useQuizzes";
import dayjs from "dayjs";
import {
  School,
  MenuBook,
  CheckCircle,
  Search,
  BookOutlined,
  Event,
  AccessTime,
  Group,
} from "@mui/icons-material";
import { getCourseImageSrc, hasCourseImage } from "@/utils/courseMedia";

const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatSchedule(schedule = []) {
  return schedule.map((s) => `${DAY_NAMES[s.dayOfWeek]} ${s.startTime}–${s.endTime}`).join(" | ");
}

const STATUS_CONFIG = {
  open: { label: "Đang mở ĐK", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  closed: { label: "Đã đóng ĐK", color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  ongoing: { label: "Đang học", color: "#2563eb", bg: "rgba(37,99,235,0.08)" },
  finished: { label: "Đã kết thúc", color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

const TAB_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "ongoing", label: "Đang học" },
  { key: "open", label: "Sắp khai giảng" },
  { key: "finished", label: "Đã kết thúc" },
];

export default function MyClassesPage() {
  const { data: classes = [], isLoading } = useMyClasses();
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all"
    ? classes
    : classes.filter((c) => c.status === activeTab);

  return (
    <div style={{ minHeight: "100vh", width: "100%", flex: 1, background: "linear-gradient(135deg,#fff7f7 0%,#fff 60%,#f0f4ff 100%)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg,#b91c1c,#dc2626)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(185,28,28,0.3)", fontSize: 24
            }}>
              <School style={{ color: "#fff" }} />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1a1a1a", margin: 0 }}>
                Lớp học của tôi
              </h1>
              <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                Theo dõi tiến trình học tập của bạn
              </p>
            </div>
          </div>

          {/* Summary pills */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(185,28,28,0.06)", borderRadius: 999,
              padding: "6px 16px", fontSize: 14, fontWeight: 700, color: "#b91c1c"
            }}>
              <MenuBook fontSize="small" /> {classes.length} lớp đã đăng ký
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(37,99,235,0.06)", borderRadius: 999,
              padding: "6px 16px", fontSize: 14, fontWeight: 700, color: "#2563eb"
            }}>
              <BookOutlined fontSize="small" /> {classes.filter(c => c.status === "ongoing").length} đang học
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(107,114,128,0.06)", borderRadius: 999,
              padding: "6px 16px", fontSize: 14, fontWeight: 700, color: "#6b7280"
            }}>
              <CheckCircle fontSize="small" /> {classes.filter(c => c.status === "finished").length} hoàn thành
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24,
          background: "#f9fafb", borderRadius: 12, padding: 4
        }}>
          {TAB_FILTERS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 9, border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                background: activeTab === tab.key ? "#fff" : "transparent",
                color: activeTab === tab.key ? "#b91c1c" : "#6b7280",
                boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: 160, borderRadius: 20, background: "#f3f4f6",
                animation: "skeleton 1.5s ease-in-out infinite"
              }} />
            ))}
            <style>{`@keyframes skeleton{0%,100%{opacity:1}50%{opacity:.55}}`}</style>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "#fff", borderRadius: 24,
            border: "2px dashed #fecaca"
          }}>
            <MenuBook style={{ fontSize: 64, marginBottom: 16, color: "#b91c1c" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
              {activeTab === "all" ? "Bạn chưa đăng ký lớp học nào" : "Không có lớp nào"}
            </h3>
            <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 24 }}>
              {activeTab === "all" ? "Khám phá các khóa học và đăng ký lớp học phù hợp." : "Thay đổi bộ lọc để xem lớp khác."}
            </p>
            {activeTab === "all" && (
              <Link to="/courses" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg,#b91c1c,#dc2626)",
                color: "#fff", padding: "12px 28px", borderRadius: 12,
                fontWeight: 700, textDecoration: "none", fontSize: 15,
                boxShadow: "0 4px 16px rgba(185,28,28,0.3)"
              }}>
                <Search fontSize="small" /> Tìm khóa học ngay
              </Link>
            )}
          </div>
        )}

        {/* Class cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((cls) => {
            const cfg = STATUS_CONFIG[cls.status] || STATUS_CONFIG.closed;
            const deadlinePassed = cls.registrationDeadline && new Date() > new Date(cls.registrationDeadline);

            return (
              <Link
                key={cls._id}
                to={`/class/${cls._id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "#fff", borderRadius: 20,
                    border: "1.5px solid #f3f4f6", overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.25s ease", cursor: "pointer"
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
                  {/* Top accent bar */}
                  <div style={{
                    height: 4,
                    background: cls.status === "ongoing"
                      ? "linear-gradient(90deg,#2563eb,#60a5fa)"
                      : cls.status === "open"
                        ? "linear-gradient(90deg,#16a34a,#4ade80)"
                        : cls.status === "finished"
                          ? "#e5e7eb"
                          : "linear-gradient(90deg,#dc2626,#f87171)"
                  }} />

                  <div style={{ padding: "20px 24px" }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: 72, height: 72, flexShrink: 0, borderRadius: 14,
                        overflow: "hidden", background: "#f9fafb",
                        border: "1px solid #f3f4f6"
                      }}>
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
                          <div style={{
                            width: "100%", height: "100%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 28, background: "linear-gradient(135deg,#fef2f2,#fff7f7)"
                          }}>
                            <BookOutlined style={{ color: "#b91c1c" }} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          {cls.course?.targetLevel && (
                            <span style={{
                              padding: "2px 10px", borderRadius: 999,
                              background: "rgba(185,28,28,0.08)", color: "#b91c1c",
                              fontSize: 11, fontWeight: 700
                            }}>{cls.course.targetLevel}</span>
                          )}
                          <span style={{
                            padding: "2px 10px", borderRadius: 999,
                            background: cfg.bg, color: cfg.color,
                            fontSize: 11, fontWeight: 600
                          }}>{cfg.label}</span>
                        </div>

                        <h3 style={{
                          fontSize: 18, fontWeight: 800, color: "#1a1a1a", margin: "0 0 2px 0",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                        }}>
                          {cls.name}
                        </h3>

                        {cls.course?.title && (
                          <p style={{
                            color: "#6b7280", fontSize: 13, margin: "0 0 10px 0",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                          }}>
                            {cls.course.title}
                          </p>
                        )}

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#9ca3af" }}>
                          {cls.teacher?.name && <span><School fontSize="inherit" /> {cls.teacher.name}</span>}
                          {cls.schedule?.length > 0 && <span><Event fontSize="inherit" /> {formatSchedule(cls.schedule)}</span>}
                          {cls.startDate && <span><AccessTime fontSize="inherit" /> Khai giảng: {dayjs(cls.startDate).format("DD/MM/YYYY")}</span>}
                          {cls.endDate && <span><CheckCircle fontSize="inherit" /> Kết thúc: {dayjs(cls.endDate).format("DD/MM/YYYY")}</span>}
                        </div>
                      </div>

                      {/* CTA */}
                      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <div style={{
                          padding: "8px 20px", borderRadius: 10,
                          background: "linear-gradient(135deg,#b91c1c,#dc2626)",
                          color: "#fff", fontWeight: 700, fontSize: 14,
                          boxShadow: "0 4px 12px rgba(185,28,28,0.25)",
                          whiteSpace: "nowrap"
                        }}>
                          Vào lớp →
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>
                          {cls.enrolledCount}/{cls.maxStudents} học viên
                        </div>
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
