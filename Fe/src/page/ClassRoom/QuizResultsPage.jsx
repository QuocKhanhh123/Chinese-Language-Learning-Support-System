import { useParams, useNavigate } from "react-router-dom";
import { useQuizResults } from "../../hooks/useQuizzes";
import dayjs from "dayjs";
import CircularProgress from "@mui/material/CircularProgress";
import {
  ArrowBack,
  BarChartRounded,
  GroupsRounded,
  TaskAltRounded,
  HourglassEmptyRounded,
  TrendingUp,
  EmojiEvents,
  WarningAmber,
  LeaderboardRounded,
  PersonRounded,
} from "@mui/icons-material";

const CONTENT_MAX = 1040;

const pageOuter = {
  minHeight: "100vh",
  width: "100%",
  flex: 1,
  boxSizing: "border-box",
  background: "linear-gradient(135deg,#fff7f7 0%,#fff 60%,#f0f4ff 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default function QuizResultsPage() {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuizResults(quizId);

  if (isLoading) {
    return (
      <div
        style={{
          ...pageOuter,
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <CircularProgress size={44} sx={{ color: "#b91c1c", display: "block", mx: "auto", mb: 2 }} />
          <p style={{ color: "#6b7280", fontSize: 16 }}>Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  const avgPct = data?.results?.length
    ? Math.round(data.results.reduce((s, r) => s + r.percentage, 0) / data.results.length)
    : 0;
  const highestScore = data?.results?.[0]?.percentage ?? 0;

  const stats = [
    {
      Icon: GroupsRounded,
      label: "Tổng học viên",
      value: data?.totalStudents,
      color: "#2563eb",
      bg: "rgba(37,99,235,0.08)",
    },
    {
      Icon: TaskAltRounded,
      label: "Đã nộp bài",
      value: data?.submittedCount,
      color: "#16a34a",
      bg: "rgba(22,163,74,0.08)",
    },
    {
      Icon: HourglassEmptyRounded,
      label: "Chưa làm",
      value: (data?.totalStudents ?? 0) - (data?.submittedCount ?? 0),
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
    },
    {
      Icon: TrendingUp,
      label: "Điểm TB",
      value: `${avgPct}%`,
      color: "#b91c1c",
      bg: "rgba(185,28,28,0.08)",
    },
    {
      Icon: EmojiEvents,
      label: "Điểm cao nhất",
      value: `${highestScore}%`,
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.08)",
    },
  ];

  function RankCell({ idx }) {
    if (idx === 0)
      return <EmojiEvents sx={{ fontSize: 26, color: "#eab308", verticalAlign: "middle" }} />;
    if (idx === 1)
      return <EmojiEvents sx={{ fontSize: 26, color: "#94a3b8", verticalAlign: "middle" }} />;
    if (idx === 2)
      return <EmojiEvents sx={{ fontSize: 26, color: "#d97706", verticalAlign: "middle" }} />;
    return (
      <span style={{ fontSize: 15, fontWeight: 800, color: "#9ca3af" }}>#{idx + 1}</span>
    );
  }

  return (
    <div style={pageOuter}>
      <div
        style={{
          width: "100%",
          maxWidth: CONTENT_MAX,
          padding: "32px 24px 48px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => navigate(`/class/${classId}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 11,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <ArrowBack fontSize="small" /> Về lớp học
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <BarChartRounded sx={{ fontSize: 36, color: "#b91c1c", flexShrink: 0 }} />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1a1a1a", margin: 0 }}>
                Kết quả bài kiểm tra
              </h1>
              {data?.quizTitle && (
                <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>{data.quizTitle}</p>
              )}
            </div>
          </div>
        </div>

        {data && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))",
                gap: 16,
                marginBottom: 28,
              }}
            >
              {stats.map(({ Icon, label, value, color, bg }) => (
                <div
                  key={label}
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: "22px 18px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1.5px solid #f3f4f6",
                    textAlign: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 32, color, mb: 1 }} />
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color,
                      background: bg,
                      borderRadius: 10,
                      padding: "6px 12px",
                      display: "inline-block",
                      marginBottom: 8,
                    }}
                  >
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>

            {data.results?.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  border: "1.5px solid #f3f4f6",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  marginBottom: 24,
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    margin: "0 0 16px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <LeaderboardRounded sx={{ color: "#b91c1c", fontSize: 26 }} />
                  Phân bố điểm số
                </h2>
                <div style={{ display: "flex", gap: 8, height: 80, alignItems: "flex-end" }}>
                  {["0-20", "21-40", "41-60", "61-80", "81-100"].map((range, i) => {
                    const [min, max] = range.split("-").map(Number);
                    const count = data.results.filter((r) => r.percentage >= min && r.percentage <= max)
                      .length;
                    const pct = data.results.length > 0 ? Math.round((count / data.results.length) * 100) : 0;
                    const colors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#16a34a"];
                    return (
                      <div
                        key={range}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{count}</div>
                        <div
                          style={{
                            width: "100%",
                            borderRadius: "6px 6px 0 0",
                            background: colors[i],
                            opacity: count === 0 ? 0.2 : 1,
                            height: `${Math.max(4, pct)}%`,
                            minHeight: 4,
                            transition: "height 0.5s ease",
                          }}
                        />
                        <div style={{ fontSize: 10, color: "#9ca3af" }}>{range}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data.results?.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  border: "1.5px solid #f3f4f6",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  marginBottom: 24,
                  overflow: "hidden",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    margin: "0 0 16px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <EmojiEvents sx={{ color: "#eab308", fontSize: 28 }} /> Bảng điểm
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["Hạng", "Học viên", "Điểm", "%", "Thời gian nộp"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 14px",
                              textAlign: "left",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#6b7280",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.results.map((r, idx) => {
                        const pctColor =
                          r.percentage >= 80 ? "#16a34a" : r.percentage >= 60 ? "#f59e0b" : "#ef4444";
                        const pctBg =
                          r.percentage >= 80
                            ? "rgba(22,163,74,0.1)"
                            : r.percentage >= 60
                              ? "rgba(245,158,11,0.1)"
                              : "rgba(239,68,68,0.1)";
                        return (
                          <tr
                            key={r._id}
                            style={{
                              borderTop: "1px solid #f3f4f6",
                              background: idx % 2 === 0 ? "#fff" : "#fafafa",
                            }}
                          >
                            <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                              <RankCell idx={idx} />
                            </td>
                            <td style={{ padding: "12px 14px", minWidth: 200 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg,#b91c1c,#dc2626)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    flexShrink: 0,
                                  }}
                                >
                                  {r.student?.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontWeight: 700,
                                      color: "#1a1a1a",
                                      fontSize: 14,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <PersonRounded sx={{ fontSize: 18, color: "#9ca3af", flexShrink: 0 }} />
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {r.student?.name}
                                    </span>
                                  </div>
                                  <div style={{ color: "#9ca3af", fontSize: 12 }}>
                                    {r.student?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                fontWeight: 800,
                                color: "#1a1a1a",
                                fontSize: 16,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {r.score}/{r.totalQuestions}
                            </td>
                            <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: 999,
                                  background: pctBg,
                                  color: pctColor,
                                  fontWeight: 700,
                                  fontSize: 14,
                                }}
                              >
                                {r.percentage}%
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 13, whiteSpace: "nowrap" }}>
                              {dayjs(r.submittedAt).format("DD/MM/YYYY HH:mm")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data.notSubmitted?.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  border: "1.5px solid #fde68a",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#92400e",
                    margin: "0 0 16px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <WarningAmber sx={{ fontSize: 28, color: "#d97706" }} /> Chưa làm bài (
                  {data.notSubmitted.length} học viên)
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.notSubmitted.map((s) => (
                    <div
                      key={s._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        borderRadius: 12,
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "#f59e0b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 15,
                          flexShrink: 0,
                        }}
                      >
                        {s.name?.[0] ? s.name[0].toUpperCase() : <PersonRounded sx={{ fontSize: 22 }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "#92400e", fontSize: 14 }}>{s.name}</div>
                        <div style={{ color: "#b45309", fontSize: 12 }}>{s.email}</div>
                      </div>
                      <span style={{ fontSize: 12, color: "#d97706", fontWeight: 700, flexShrink: 0 }}>
                        Chưa nộp
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
