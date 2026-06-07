import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useClassDetail, useChangeClassStatus } from "../../hooks/useClasses";
import { useQuizzesByClass, useMyQuizResults } from "../../hooks/useQuizzes";
import useAuthStore from "../../store/useAuthStore";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import axiosInstance from "../../network/httpRequest";
import {
  Assignment,
  AutoGraph,
  AccessTime,
  BookOutlined,
  CheckCircle,
  EditNote,
  Event,
  Flag,
  Groups,
  ImageNotSupported,
  MenuBook,
  Person,
  PictureAsPdf,
  Publish,
  School,
  Settings,
  StackedBarChart,
} from "@mui/icons-material";
import { getCourseImageSrc, hasCourseImage } from "@/utils/courseMedia";

const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
function formatSchedule(schedule = []) {
  return schedule.map((s) => `${DAY_NAMES[s.dayOfWeek]} ${s.startTime}–${s.endTime}`).join(" | ");
}

const STATUS_CONFIG = {
  open: { label: "Đang mở đăng ký", color: "#16a34a", bg: "rgba(22,163,74,0.1)", border: "#bbf7d0" },
  closed: { label: "Đã đóng đăng ký", color: "#dc2626", bg: "rgba(220,38,38,0.1)", border: "#fecaca" },
  ongoing: { label: "Đang diễn ra", color: "#2563eb", bg: "rgba(37,99,235,0.1)", border: "#bfdbfe" },
  finished: { label: "Đã kết thúc", color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "#e5e7eb" },
};

// ─── Teacher View ───────────────────────────────────────────────────────────
function TeacherView({ cls, quizzes, classId }) {
  const changeStatus = useChangeClassStatus();
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus) => {
    try {
      await changeStatus.mutateAsync({ classId, status: newStatus });
      toast.success(`Đã chuyển trạng thái lớp thành "${newStatus}"`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const STATUS_OPTIONS = [
    { value: "open", label: "Mở đăng ký" },
    { value: "closed", label: "Đóng đăng ký" },
    { value: "ongoing", label: "Đang diễn ra" },
    { value: "finished", label: "Kết thúc" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Status management */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: 24,
        border: "1.5px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px 0" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Settings fontSize="small" /> Quản lý trạng thái lớp</span>
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              disabled={cls.status === opt.value || changeStatus.isPending}
              style={{
                padding: "8px 18px", borderRadius: 10, border: "1.5px solid",
                cursor: cls.status === opt.value ? "default" : "pointer",
                fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                background: cls.status === opt.value ? "#f3f4f6" : "#fff",
                borderColor: cls.status === opt.value ? "#d1d5db" : "#e5e7eb",
                color: cls.status === opt.value ? "#6b7280" : "#374151",
                opacity: cls.status === opt.value ? 0.7 : 1,
              }}
            >
              {opt.label} {cls.status === opt.value ? "(hiện tại)" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Students section */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: 24,
        border: "1.5px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Groups fontSize="small" /> Học viên ({cls.studentIds?.length || 0}/{cls.maxStudents})</span>
          </h2>
          <div style={{
            fontSize: 12, color: "#6b7280",
            background: "#f9fafb", padding: "4px 12px", borderRadius: 999
          }}>
            Còn {Math.max(0, cls.maxStudents - (cls.studentIds?.length || 0))} chỗ
          </div>
        </div>

        {(!cls.studentIds || cls.studentIds.length === 0) ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
            <Person style={{ fontSize: 32, marginBottom: 8 }} />
            <p style={{ margin: 0 }}>Chưa có học viên nào đăng ký</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cls.studentIds.map((s, i) => (
              <div key={s._id || s} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 12,
                background: i % 2 === 0 ? "#fafafa" : "#fff",
                border: "1px solid #f3f4f6"
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg,#b91c1c,#dc2626)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0
                }}>
                  {s.name ? s.name[0].toUpperCase() : (i + 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#1a1a1a", fontSize: 14 }}>{s.name || "—"}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>{s.email || ""}</div>
                </div>
                <div style={{ fontSize: 11, color: "#d1d5db", fontWeight: 600 }}>#{i + 1}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quizzes section (Teacher) */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: 24,
        border: "1.5px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Assignment fontSize="small" /> Bài kiểm tra ({quizzes.length})</span>
          </h2>
          <Link to={`/class/${classId}/create-quiz`} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 18px", borderRadius: 10,
              background: "linear-gradient(135deg,#b91c1c,#dc2626)",
              color: "#fff", fontWeight: 700, fontSize: 13,
              boxShadow: "0 4px 12px rgba(185,28,28,0.25)"
            }}>
              + Tạo bài kiểm tra
            </div>
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
            <Assignment style={{ fontSize: 32, marginBottom: 8 }} />
            <p style={{ margin: 0 }}>Chưa có bài kiểm tra nào. Tạo bài test cho học viên!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {quizzes.map((q) => (
              <div key={q._id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px", borderRadius: 14,
                background: "#fafafa", border: "1px solid #f3f4f6",
                gap: 12
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>
                    {q.title}
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9ca3af", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><StackedBarChart fontSize="inherit" /> {q.questions?.length || 0} câu hỏi</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Event fontSize="inherit" /> Mở: {q.opensAt ? dayjs(q.opensAt).format("DD/MM/YYYY HH:mm") : "Luôn mở"}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><AccessTime fontSize="inherit" /> {q.durationMinutes ?? 15} phút làm</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><EditNote fontSize="inherit" /> {q.stats?.attemptCount || 0} lần nộp</span>
                    <span style={{
                      padding: "2px 8px", borderRadius: 999, fontWeight: 600,
                      background: q.status === "published" ? "rgba(22,163,74,0.1)" : "rgba(107,114,128,0.1)",
                      color: q.status === "published" ? "#16a34a" : "#6b7280"
                    }}>
                      {q.status === "published" ? "Đã xuất bản" : "Nháp"}
                    </span>
                  </div>
                </div>
                <Link to={`/class/${classId}/quiz/${q._id}/results`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "7px 16px", borderRadius: 9, border: "1.5px solid #e5e7eb",
                    color: "#374151", fontWeight: 600, fontSize: 13,
                    background: "#fff", cursor: "pointer"
                  }}>
                    Xem kết quả →
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Student View ────────────────────────────────────────────────────────────
function StudentView({ cls, quizzes, classId }) {
  const { data: myResults = [] } = useMyQuizResults(classId);

  const getMyResult = (quizId) => myResults.find((r) => r.quiz?._id === quizId || r.quiz === quizId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* My progress */}
      {quizzes.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg,#b91c1c,#dc2626)",
          borderRadius: 20, padding: 24, color: "#fff",
          boxShadow: "0 8px 24px rgba(185,28,28,0.3)"
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px 0", opacity: 0.9 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><AutoGraph fontSize="small" /> Tiến trình học tập</span>
          </h2>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 900 }}>{myResults.length}/{quizzes.filter(q => q.status === "published").length}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>bài đã làm</div>
            </div>
            {myResults.length > 0 && (
              <div>
                <div style={{ fontSize: 36, fontWeight: 900 }}>
                  {Math.round(myResults.reduce((s, r) => s + (r.percentage || 0), 0) / myResults.length)}%
                </div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>điểm trung bình</div>
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
              Hoàn thành {myResults.length}/{quizzes.filter(q => q.status === "published").length} bài kiểm tra
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4, background: "#fff",
                width: quizzes.filter(q => q.status === "published").length > 0
                  ? `${Math.round(myResults.length / quizzes.filter(q => q.status === "published").length * 100)}%`
                  : "0%",
                transition: "width 0.8s ease"
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Quizzes for student */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: 24,
        border: "1.5px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px 0" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Assignment fontSize="small" /> Bài kiểm tra</span>
        </h2>

        {quizzes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
            <Assignment style={{ fontSize: 32, marginBottom: 8 }} />
            <p style={{ margin: 0 }}>Chưa có bài kiểm tra nào. Giáo viên sẽ tạo bài sớm thôi!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {quizzes.map((q) => {
              const myResult = getMyResult(q._id);
              const opensAt = q.opensAt ? new Date(q.opensAt) : null;
              const notYetOpen = Boolean(opensAt && opensAt.getTime() > Date.now());
              return (
                <div key={q._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 20px", borderRadius: 14, gap: 12,
                  background: myResult ? "rgba(22,163,74,0.04)" : notYetOpen ? "rgba(245,158,11,0.06)" : "#fafafa",
                  border: `1px solid ${myResult ? "#bbf7d0" : notYetOpen ? "#fde68a" : "#f3f4f6"}`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>
                      {q.title}
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9ca3af", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><StackedBarChart fontSize="inherit" /> {q.questions?.length || 0} câu hỏi</span>
                      {opensAt && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Event fontSize="inherit" />
                          {notYetOpen ? `Mở lúc ${dayjs(opensAt).format("DD/MM/YYYY HH:mm")}` : `Đã mở từ ${dayjs(opensAt).format("DD/MM/YYYY HH:mm")}`}
                        </span>
                      )}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <AccessTime fontSize="inherit" /> {q.durationMinutes ?? 15} phút làm bài
                      </span>
                      {myResult ? (
                        <span style={{
                          padding: "2px 10px", borderRadius: 999, fontWeight: 700,
                          background: myResult.percentage >= 80 ? "rgba(22,163,74,0.1)" : myResult.percentage >= 50 ? "rgba(245,158,11,0.1)" : "rgba(220,38,38,0.1)",
                          color: myResult.percentage >= 80 ? "#16a34a" : myResult.percentage >= 50 ? "#d97706" : "#dc2626"
                        }}>
                          Đã làm: {myResult.score}/{myResult.totalQuestions} ({myResult.percentage}%)
                        </span>
                      ) : notYetOpen ? (
                        <span style={{
                          padding: "2px 10px", borderRadius: 999, fontWeight: 700,
                          background: "rgba(245,158,11,0.15)", color: "#b45309"
                        }}>
                          Chưa đến giờ mở bài
                        </span>
                      ) : (
                        <span style={{
                          padding: "2px 10px", borderRadius: 999, fontWeight: 600,
                          background: "rgba(107,114,128,0.08)", color: "#6b7280"
                        }}>
                          Chưa làm
                        </span>
                      )}
                    </div>
                  </div>

                  {!myResult && !notYetOpen ? (
                    <Link to={`/class/${classId}/quiz/${q._id}/take`} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "8px 20px", borderRadius: 10,
                        background: "linear-gradient(135deg,#b91c1c,#dc2626)",
                        color: "#fff", fontWeight: 700, fontSize: 13,
                        boxShadow: "0 4px 12px rgba(185,28,28,0.2)", whiteSpace: "nowrap"
                      }}>
                        Làm bài →
                      </div>
                    </Link>
                  ) : !myResult && notYetOpen ? (
                    <div style={{
                      padding: "8px 16px", borderRadius: 10,
                      background: "#fffbeb", border: "1px solid #fde68a",
                      color: "#92400e", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap"
                    }}>
                      Đợi mở bài
                    </div>
                  ) : (
                    <div style={{
                      padding: "8px 16px", borderRadius: 10,
                      background: "#f9fafb", border: "1px solid #e5e7eb",
                      color: "#6b7280", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap"
                    }}>
                      Đã nộp
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ClassRoomPage() {
  const { classId } = useParams();
  const { user } = useAuthStore();
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const { data: cls, isLoading: loadingClass } = useClassDetail(classId);
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuizzesByClass(classId);

  const isLoading = loadingClass || loadingQuizzes;
  const cfg = STATUS_CONFIG[cls?.status] || STATUS_CONFIG.closed;

  return (
    <div style={{ minHeight: "100vh", width: "100%", flex: 1, background: "linear-gradient(135deg,#fff7f7 0%,#fff 60%,#f0f4ff 100%)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ height: 200, borderRadius: 24, background: "#f3f4f6", animation: "skeleton 1.5s ease-in-out infinite" }} />
            <div style={{ height: 300, borderRadius: 24, background: "#f3f4f6", animation: "skeleton 1.5s ease-in-out infinite" }} />
            <style>{`@keyframes skeleton{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
          </div>
        )}

        {cls && (
          <>
            {/* Class Hero */}
            <div style={{
              background: "#fff", borderRadius: 24,
              overflow: "hidden", marginBottom: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              border: "1.5px solid #f3f4f6"
            }}>
              {/* Banner */}
              <div style={{
                height: 120,
                background: "linear-gradient(135deg,#7f1d1d 0%,#b91c1c 50%,#dc2626 100%)",
                position: "relative", overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.07,
                  backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
                  backgroundSize: "20px 20px"
                }} />
                <div style={{
                  position: "absolute", bottom: 20, left: 28,
                  display: "flex", alignItems: "center", gap: 12
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    overflow: "hidden", border: "3px solid rgba(255,255,255,0.3)",
                    background: "#fff", flexShrink: 0
                  }}>
                    {hasCourseImage(cls.course) ? (
                      <img
                        src={getCourseImageSrc(cls.course)}
                        alt={cls.name}
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
                      }}><ImageNotSupported style={{ color: "#9ca3af" }} /></div>
                    )}
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      {cls.course?.targetLevel && (
                        <span style={{
                          padding: "2px 10px", borderRadius: 999,
                          background: "rgba(255,255,255,0.2)", color: "#fff",
                          fontSize: 11, fontWeight: 700
                        }}>{cls.course.targetLevel}</span>
                      )}
                      <span style={{
                        padding: "2px 10px", borderRadius: 999,
                        background: cfg.bg, color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                        fontSize: 11, fontWeight: 600
                      }}>{cfg.label}</span>
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>
                      {cls.name}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Info strip */}
              <div style={{
                padding: "16px 28px",
                display: "flex", flexWrap: "wrap", gap: 20, fontSize: 13, color: "#6b7280"
              }}>
                {cls.teacher?.name && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <School fontSize="inherit" />
                    <span><strong style={{ color: "#374151" }}>{cls.teacher.name}</strong></span>
                  </span>
                )}
                {cls.schedule?.length > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Event fontSize="inherit" /> {formatSchedule(cls.schedule)}</span>
                )}
                {cls.startDate && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Event fontSize="inherit" /> {dayjs(cls.startDate).format("DD/MM/YYYY")}</span>
                )}
                {cls.endDate && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Flag fontSize="inherit" /> {dayjs(cls.endDate).format("DD/MM/YYYY")}</span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Groups fontSize="inherit" /> {cls.studentIds?.length || 0}/{cls.maxStudents} học viên</span>
              </div>
            </div>

            {/* HSK Document Banner */}
            {cls.course?.targetLevel?.startsWith("HSK") && (
              <div style={{
                background: "linear-gradient(90deg, #fafafa, #fff)",
                borderRadius: 20, padding: "20px 28px", marginBottom: 24,
                border: "1.5px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)", flexWrap: "wrap", gap: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <MenuBook style={{ fontSize: 32, color: "#b91c1c" }} />
                  <div>
                    <div style={{ fontWeight: 800, color: "#1a1a1a", fontSize: 16, marginBottom: 4 }}>
                      Giáo trình tiêu chuẩn {cls.course.targetLevel}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      Tài liệu PDF gốc dùng để ôn tập và theo dõi bài giảng trên lớp.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const baseUrl = axiosInstance.defaults.baseURL || "http://localhost:4000/api";
                    const token = localStorage.getItem("token") || "";
                    const url = `${baseUrl}/courses/document/${cls.course._id}?token=${token}`;
                    window.open(url, "_blank");
                  }}
                  style={{
                    padding: "10px 20px", borderRadius: 12, background: "#fff", border: "1.5px solid #d1d5db",
                    color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 8
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.transform = "translateY(-1px)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.transform = "translateY(0)" }}
                >
                  <PictureAsPdf fontSize="small" /> Mở xem PDF
                </button>
              </div>
            )}

            {/* Main content */}
            {isTeacher && <TeacherView cls={cls} quizzes={quizzes} classId={classId} />}
            {isStudent && <StudentView cls={cls} quizzes={quizzes} classId={classId} />}
          </>
        )}
      </div>
    </div>
  );
}
