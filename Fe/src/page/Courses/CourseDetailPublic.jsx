import { useParams, useNavigate } from "react-router-dom";
import { useCourseById } from "../../hooks/useCourses";
import { useClassesByCourse } from "../../hooks/useClasses";
import dayjs from "dayjs";
import {
  AccessTime,
  BookOutlined,
  Class,
  HourglassEmpty,
  LocalAtm,
  School,
  Verified,
} from "@mui/icons-material";
import {
  COURSE_FALLBACK_IMAGE,
  getCourseImageSrc,
  hasCourseImage,
} from "@/utils/courseMedia";

const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatSchedule(schedule = []) {
  return schedule.map((s) => `${DAY_NAMES[s.dayOfWeek]} ${s.startTime}–${s.endTime}`).join(" | ");
}

const STATUS_CONFIG = {
  open: { label: "Đang mở đăng ký", color: "#16a34a", bg: "rgba(22,163,74,0.1)", border: "#bbf7d0", canRegister: true },
  closed: { label: "Đã đóng đăng ký", color: "#dc2626", bg: "rgba(220,38,38,0.1)", border: "#fecaca", canRegister: false },
  ongoing: { label: "Đang diễn ra", color: "#2563eb", bg: "rgba(37,99,235,0.1)", border: "#bfdbfe", canRegister: false },
  finished: { label: "Đã kết thúc", color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "#e5e7eb", canRegister: false },
};

export default function CourseDetailPublic() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data: courseData, isLoading: loadingCourse } = useCourseById(courseId);
  const { data: classes = [], isLoading: loadingClasses } = useClassesByCourse(courseId);

  const course = courseData?.course || courseData;
  const isLoading = loadingCourse || loadingClasses;

  const handleRegister = (cls) => {
    navigate("/checkout", {
      state: {
        classId: cls._id,
        className: cls.name,
        courseName: course?.title,
        courseLevel: course?.targetLevel,
        teacher: cls.teacher?.name,
        schedule: formatSchedule(cls.schedule),
        startDate: cls.startDate,
        deadline: cls.registrationDeadline,
        price: course?.price || 0,
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh", width: "100%", flex: 1, background: "linear-gradient(135deg,#fff7f7,#fff)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <HourglassEmpty style={{ fontSize: 40, marginBottom: 12, color: "#b91c1c" }} />
          <p style={{ color: "#6b7280", fontSize: 16 }}>Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", width: "100%", flex: 1, background: "linear-gradient(135deg,#fff7f7 0%,#fff 60%,#f0f4ff 100%)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>

        {course && (
          <>
            {/* Course header */}
            <div style={{
              background: "#fff", borderRadius: 24, overflow: "hidden",
              marginBottom: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
              border: "1.5px solid #f3f4f6"
            }}>
              {/* Banner */}
              <div style={{
                height: 160,
                background: "linear-gradient(135deg,#7f1d1d 0%,#b91c1c 50%,#dc2626 100%)",
                position: "relative", overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.06,
                  backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
                  backgroundSize: "20px 20px"
                }} />
                {hasCourseImage(course) && (
                  <img src={getCourseImageSrc(course)} alt={course.title}
                    style={{
                      position: "absolute", right: 0, top: 0,
                      height: "100%", width: "40%", objectFit: "cover",
                      maskImage: "linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 100%)"
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = COURSE_FALLBACK_IMAGE;
                    }}
                  />
                )}
                <div style={{ position: "absolute", bottom: 24, left: 28 }}>
                  <span style={{
                    padding: "4px 14px", borderRadius: 999,
                    background: "rgba(255,255,255,0.2)", color: "#fff",
                    fontSize: 12, fontWeight: 700, marginBottom: 8, display: "inline-block"
                  }}>
                    {course.targetLevel}
                  </span>
                  <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0 }}>
                    {course.title}
                  </h1>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "24px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.7, margin: "0 0 16px 0" }}>
                      {course.description}
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { icon: <BookOutlined fontSize="inherit" />, text: `${classes.length} lớp đang mở` },
                        { icon: <Verified fontSize="inherit" />, text: `Cấp độ ${course.targetLevel}` },
                      ].map((item) => (
                        <span key={item.text} style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: 999,
                          background: "rgba(185,28,28,0.06)", color: "#b91c1c",
                          fontSize: 13, fontWeight: 600
                        }}>
                          {item.icon} {item.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>Học phí</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#b91c1c", display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <LocalAtm fontSize="inherit" />
                      {course.price > 0
                        ? `${course.price.toLocaleString("vi-VN")} ₫`
                        : "Miễn phí"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Classes */}
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", marginBottom: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Class fontSize="small" /> Các lớp đang mở đăng ký
              </span>
            </h2>

            {classes.length === 0 && (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                background: "#fff", borderRadius: 24,
                border: "2px dashed #fecaca"
              }}>
                <School style={{ fontSize: 48, marginBottom: 12, color: "#b91c1c" }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
                  Chưa có lớp nào đang mở
                </h3>
                <p style={{ color: "#9ca3af", fontSize: 15 }}>
                  Vui lòng quay lại sau khi quản trị viên mở lớp mới.
                </p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {classes.map((cls) => {
                const cfg = STATUS_CONFIG[cls.status] || STATUS_CONFIG.closed;
                const canRegister = cls.isRegistrationOpen && cls.availableSpots > 0;
                const fillPct = cls.maxStudents > 0
                  ? Math.round((cls.enrolledCount / cls.maxStudents) * 100)
                  : 0;

                return (
                  <div key={cls._id} style={{
                    background: "#fff", borderRadius: 20,
                    border: "1.5px solid #f3f4f6", overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    transition: "all 0.25s ease"
                  }}>
                    {/* Status stripe */}
                    <div style={{
                      height: 4,
                      background: canRegister
                        ? "linear-gradient(90deg,#16a34a,#4ade80)"
                        : "#e5e7eb"
                    }} />

                    <div style={{ padding: "22px 26px" }}>
                      <div style={{ display: "flex", gap: 20, justifyContent: "space-between", flexWrap: "wrap" }}>
                        {/* Left info */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 999,
                              background: cfg.bg, color: cfg.color,
                              border: `1px solid ${cfg.border}`,
                              fontSize: 12, fontWeight: 600
                            }}>
                              {cfg.label}
                            </span>
                            {cls.availableSpots === 0 && (
                              <span style={{
                                padding: "3px 10px", borderRadius: 999,
                                background: "rgba(220,38,38,0.08)", color: "#dc2626",
                                fontSize: 12, fontWeight: 600
                              }}>Hết chỗ</span>
                            )}
                          </div>

                          <h3 style={{ fontSize: 19, fontWeight: 800, color: "#1a1a1a", margin: "0 0 8px 0" }}>
                            {cls.name}
                          </h3>

                          <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, color: "#6b7280" }}>
                            {cls.teacher?.name && <span><School fontSize="inherit" /> Giáo viên: <strong style={{ color: "#374151" }}>{cls.teacher.name}</strong></span>}
                            {cls.schedule?.length > 0 && <span><BookOutlined fontSize="inherit" /> Lịch học: <strong style={{ color: "#374151" }}>{formatSchedule(cls.schedule)}</strong></span>}
                            {cls.startDate && <span><Verified fontSize="inherit" /> Khai giảng: <strong style={{ color: "#374151" }}>{dayjs(cls.startDate).format("DD/MM/YYYY")}</strong></span>}
                            {cls.registrationDeadline && <span><AccessTime fontSize="inherit" /> Hạn đăng ký: <strong style={{ color: "#374151" }}>{dayjs(cls.registrationDeadline).format("DD/MM/YYYY")}</strong></span>}
                          </div>

                          {/* Slots progress */}
                          <div style={{ marginTop: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
                              <span>Chỗ còn trống</span>
                              <span style={{ fontWeight: 700, color: cls.availableSpots === 0 ? "#dc2626" : "#16a34a" }}>
                                {cls.availableSpots}/{cls.maxStudents}
                              </span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: "#f3f4f6", overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: 3,
                                background: fillPct >= 90 ? "#ef4444" : fillPct >= 60 ? "#f59e0b" : "#22c55e",
                                width: `${fillPct}%`, transition: "width 0.5s ease"
                              }} />
                            </div>
                          </div>
                        </div>

                        {/* Right CTA */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, minWidth: 160 }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 26, fontWeight: 900, color: "#b91c1c" }}>
                              {course.price > 0
                                ? `${course.price.toLocaleString("vi-VN")} ₫`
                                : "Miễn phí"}
                            </div>
                          </div>
                          <button
                            disabled={!canRegister}
                            onClick={() => canRegister && handleRegister(cls)}
                            style={{
                              padding: "12px 20px", borderRadius: 12, border: "none",
                              fontWeight: 800, fontSize: 15, cursor: canRegister ? "pointer" : "not-allowed",
                              background: canRegister
                                ? "linear-gradient(135deg,#b91c1c,#dc2626)"
                                : "#e5e7eb",
                              color: canRegister ? "#fff" : "#9ca3af",
                              boxShadow: canRegister ? "0 4px 16px rgba(185,28,28,0.3)" : "none",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={e => { if (canRegister) e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                          >
                            {cls.availableSpots === 0
                              ? "Hết chỗ"
                              : !cls.isRegistrationOpen
                                ? "Hết hạn đăng ký"
                                : "Đăng ký ngay"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
