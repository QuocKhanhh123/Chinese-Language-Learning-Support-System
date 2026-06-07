import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQuizDetail, useSubmitQuiz, useStartQuiz } from "../../hooks/useQuizzes";
import {
  Quiz as QuizIcon,
  BarChartRounded,
  ScheduleRounded,
  RadioButtonChecked,
  WarningAmber,
  RocketLaunch,
  HourglassEmpty,
  Timer,
  EmojiEvents,
  MenuBookRounded,
  CheckCircle,
  Cancel,
  NavigateBefore,
  ArrowBack,
  SendRounded,
  HourglassEmptyOutlined,
  ErrorOutline,
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";

/** Chiều ngang khu làm bài — lớn hơn trước, căn giữa trong layout */
const CONTENT_MAX = 920;

function formatTime(secs) {
  const m = Math.floor(Math.max(0, secs) / 60).toString().padStart(2, "0");
  const s = (Math.max(0, secs) % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function expiresAtToSecondsLeft(expiresAtIso) {
  const end = new Date(expiresAtIso).getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / 1000));
}

const pageOuter = {
  minHeight: "100vh",
  width: "100%",
  flex: 1,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const centeredInner = (maxW = CONTENT_MAX, pad = "32px 24px") => ({
  width: "100%",
  maxWidth: maxW,
  margin: "0 auto",
  padding: pad,
  boxSizing: "border-box",
});

export default function TakeQuizPage() {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();

  const { data: quiz, isLoading, isError, error } = useQuizDetail(quizId);
  const submitQuiz = useSubmitQuiz(quizId);
  const startQuiz = useStartQuiz(quizId);

  const [selected, setSelected] = useState({});
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [starting, setStarting] = useState(false);

  const timerRef = useRef(null);
  const expiresAtRef = useRef(null);
  const submitLockRef = useRef(false);

  const handleSubmit = useCallback(async (auto = false) => {
    if (!quiz || submitLockRef.current) return;
    if (!auto) {
      const unanswered = quiz.questions.filter((q) => selected[q._id] === undefined);
      if (unanswered.length > 0) {
        const ok = window.confirm(
          `Còn ${unanswered.length} câu chưa chọn đáp án. Bạn có muốn nộp bài không?`
        );
        if (!ok) return;
      }
    }
    clearInterval(timerRef.current);

    const answers = quiz.questions.map((q) => ({
      questionId: q._id,
      selectedIndex: selected[q._id] ?? -1,
    }));

    submitLockRef.current = true;
    try {
      const res = await submitQuiz.mutateAsync(answers);
      setResult(res);
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error("Bạn đã nộp bài kiểm tra này rồi");
        navigate(`/class/${classId}`);
      } else {
        toast.error(err?.response?.data?.message || "Nộp bài thất bại");
      }
    } finally {
      submitLockRef.current = false;
    }
  }, [quiz, selected, submitQuiz, navigate, classId]);

  const beginQuizSession = async () => {
    setStarting(true);
    try {
      const data = await startQuiz.mutateAsync();
      if (data.expired) {
        toast.warn("Đã hết giờ làm bài. Đang nộp bài với các đáp án đã chọn...");
        await handleSubmit(true);
        return;
      }
      expiresAtRef.current = data.expiresAt;
      setTimeLeft(expiresAtToSecondsLeft(data.expiresAt));
      setStarted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể bắt đầu làm bài");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!started || result || !quiz) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast.warn("Hết giờ! Bài tự động được nộp và chấm điểm.");
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, result, quiz, handleSubmit]);

  useEffect(() => {
    if (!started || result) return;
    const id = setInterval(() => {
      if (expiresAtRef.current) {
        setTimeLeft(expiresAtToSecondsLeft(expiresAtRef.current));
      }
    }, 10000);
    return () => clearInterval(id);
  }, [started, result]);

  const handleSelect = (questionId, index) => {
    if (result) return;
    setSelected((prev) => ({ ...prev, [questionId]: index }));
  };

  if (isLoading) {
    return (
      <div
        style={{
          ...pageOuter,
          background: "linear-gradient(135deg,#fff7f7,#fff)",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <CircularProgress size={44} sx={{ color: "#b91c1c", mb: 2, display: "block", mx: "auto" }} />
          <p style={{ color: "#6b7280", fontSize: 16 }}>Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    const msg = error?.response?.data?.message || "Không thể tải bài kiểm tra.";
    return (
      <div
        style={{
          ...pageOuter,
          background: "linear-gradient(135deg,#fff7f7,#fff)",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "#fff",
            borderRadius: 20,
            padding: 32,
            border: "1px solid #fecaca",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          <ErrorOutline sx={{ fontSize: 48, color: "#dc2626", mb: 1 }} />
          <p style={{ fontWeight: 800, color: "#b91c1c", marginBottom: 8 }}>Không thể mở bài kiểm tra</p>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>{msg}</p>
          <button
            type="button"
            onClick={() => navigate(`/class/${classId}`)}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#b91c1c,#dc2626)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ArrowBack fontSize="small" /> Về lớp học
          </button>
        </div>
      </div>
    );
  }

  if (!quiz)
    return (
      <div style={{ ...pageOuter, justifyContent: "center", color: "#6b7280" }}>
        Không tìm thấy bài kiểm tra.
      </div>
    );

  // ─── Start screen ───────────────────────────────────────────────────────────
  if (!started && !result) {
    const metaRows = [
      {
        icon: <BarChartRounded sx={{ color: "#2563eb", fontSize: 28 }} />,
        label: "Số câu hỏi",
        value: `${quiz.questions?.length || 0} câu`,
      },
      {
        icon: <ScheduleRounded sx={{ color: "#0891b2", fontSize: 28 }} />,
        label: "Thời gian làm bài",
        value: `${quiz.durationMinutes ?? 15} phút`,
      },
      {
        icon: <RadioButtonChecked sx={{ color: "#b91c1c", fontSize: 28 }} />,
        label: "Hình thức",
        value: "Trắc nghiệm 4 đáp án",
      },
      {
        icon: <WarningAmber sx={{ color: "#d97706", fontSize: 28 }} />,
        label: "Lưu ý",
        value: "Chỉ được nộp 1 lần",
      },
    ];

    return (
      <div
        style={{
          ...pageOuter,
          background: "linear-gradient(135deg,#fff7f7,#fff,#f0f4ff)",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            width: "100%",
            background: "#fff",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(185,28,28,0.15)",
            border: "1.5px solid rgba(185,28,28,0.1)",
          }}
        >
          <div
            style={{
              padding: "40px 32px",
              textAlign: "center",
              background: "linear-gradient(135deg,#7f1d1d,#b91c1c,#dc2626)",
            }}
          >
            <QuizIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.95)", mb: 1.5 }} />
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: "0 0 6px 0" }}>{quiz.title}</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, margin: 0 }}>
              Bài kiểm tra sắp bắt đầu
            </p>
          </div>
          <div style={{ padding: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {metaRows.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    borderRadius: 12,
                    background: "#f9fafb",
                    border: "1px solid #f3f4f6",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1, fontSize: 14, color: "#6b7280" }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", textAlign: "right" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={beginQuizSession}
              disabled={starting || submitQuiz.isPending}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 14,
                border: "none",
                background: starting ? "#e5e7eb" : "linear-gradient(135deg,#b91c1c,#dc2626)",
                color: starting ? "#9ca3af" : "#fff",
                fontWeight: 800,
                fontSize: 16,
                cursor: starting ? "wait" : "pointer",
                boxShadow: starting ? "none" : "0 6px 20px rgba(185,28,28,0.3)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {starting ? (
                <>
                  <HourglassEmpty sx={{ fontSize: 22 }} /> Đang khởi tạo...
                </>
              ) : (
                <>
                  <RocketLaunch sx={{ fontSize: 22 }} /> Bắt đầu làm bài
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/class/${classId}`)}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "12px 0",
                borderRadius: 14,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                color: "#6b7280",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <ArrowBack fontSize="small" /> Quay lại lớp học
            </button>
          </div>
        </div>
      </div>
    );
  }

  function resultRankIcon(pct) {
    if (pct >= 90) return <EmojiEvents sx={{ fontSize: 72, color: "#fbbf24" }} />;
    if (pct >= 70) return <EmojiEvents sx={{ fontSize: 72, color: "#cbd5e1" }} />;
    if (pct >= 60) return <EmojiEvents sx={{ fontSize: 72, color: "#d97706" }} />;
    return <MenuBookRounded sx={{ fontSize: 72, color: "rgba(255,255,255,0.95)" }} />;
  }

  // ─── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    const passed = result.percentage >= 60;
    return (
      <div
        style={{
          ...pageOuter,
          background: "linear-gradient(135deg,#fff7f7,#fff,#f0f4ff)",
          paddingBottom: 40,
        }}
      >
        <div style={centeredInner(CONTENT_MAX, "40px 24px")}>
          <div
            style={{
              background: passed
                ? "linear-gradient(135deg,#14532d,#16a34a,#22c55e)"
                : "linear-gradient(135deg,#7f1d1d,#b91c1c,#dc2626)",
              borderRadius: 24,
              padding: 40,
              textAlign: "center",
              color: "#fff",
              marginBottom: 24,
              boxShadow: `0 12px 40px ${passed ? "rgba(34,197,94,0.3)" : "rgba(185,28,28,0.3)"}`,
            }}
          >
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
              {resultRankIcon(result.percentage)}
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px 0" }}>
              {passed ? "Chúc mừng! Bạn đã qua bài!" : "Cố gắng hơn nào!"}
            </h2>
            <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>
              {result.percentage}%
            </div>
            <div style={{ fontSize: 18, opacity: 0.9 }}>
              {result.score}/{result.totalQuestions} câu đúng
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            {result.questions?.map((q, idx) => {
              const ans = result.answers?.find((a) => a.questionId === q._id);
              return (
                <div
                  key={q._id}
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: 24,
                    border: `1.5px solid ${ans?.isCorrect ? "#bbf7d0" : "#fecaca"}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                    {ans?.isCorrect ? (
                      <CheckCircle sx={{ color: "#16a34a", fontSize: 28 }} />
                    ) : (
                      <Cancel sx={{ color: "#dc2626", fontSize: 28 }} />
                    )}
                    <div>
                      <p style={{ fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px 0", fontSize: 16 }}>
                        Câu {idx + 1}: {q.chineseText}
                      </p>
                      {q.vietnameseText && (
                        <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>{q.vietnameseText}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctIndex;
                      const isChosen = ans?.selectedIndex === oIdx;
                      let bg = "#f9fafb",
                        border = "#e5e7eb",
                        color = "#6b7280";
                      if (isCorrect) {
                        bg = "rgba(22,163,74,0.08)";
                        border = "#16a34a";
                        color = "#15803d";
                      } else if (isChosen && !isCorrect) {
                        bg = "rgba(220,38,38,0.08)";
                        border = "#dc2626";
                        color = "#dc2626";
                      }
                      return (
                        <div
                          key={oIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: `1.5px solid ${border}`,
                            background: bg,
                          }}
                        >
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 800,
                              background: isCorrect ? "#16a34a" : isChosen ? "#dc2626" : "#e5e7eb",
                              color: isCorrect || isChosen ? "#fff" : "#9ca3af",
                            }}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span style={{ fontSize: 13, color, fontWeight: isCorrect ? 700 : 400, flex: 1 }}>
                            {opt}
                          </span>
                          {isCorrect && <CheckCircle sx={{ color: "#16a34a", fontSize: 18 }} />}
                          {isChosen && !isCorrect && <Cancel sx={{ color: "#dc2626", fontSize: 18 }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/class/${classId}`)}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#b91c1c,#dc2626)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(185,28,28,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <ArrowBack fontSize="small" /> Về lớp học
          </button>
        </div>
      </div>
    );
  }

  // ─── Quiz taking screen ──────────────────────────────────────────────────────
  const total = quiz.questions?.length || 0;
  const answeredCount = Object.keys(selected).length;
  const progress = Math.round((answeredCount / total) * 100);
  const isLastQ = currentQ === total - 1;
  const isUrgent = timeLeft < 60;

  const stickyInner = {
    ...centeredInner(CONTENT_MAX, "12px 24px"),
    display: "flex",
    alignItems: "center",
    gap: 16,
    margin: 0,
  };

  return (
    <div
      style={{
        ...pageOuter,
        background: "linear-gradient(135deg,#fff7f7,#fff,#f0f4ff)",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          borderBottom: "1px solid #f3f4f6",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          width: "100%",
        }}
      >
        <div style={stickyInner}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 18,
              background: isUrgent ? "rgba(220,38,38,0.1)" : "#f9fafb",
              color: isUrgent ? "#dc2626" : "#1a1a1a",
              border: `1.5px solid ${isUrgent ? "#fecaca" : "#e5e7eb"}`,
              transition: "all 0.5s",
              animation: isUrgent ? "pulse-quiz-timer 1s ease-in-out infinite" : "none",
              flexShrink: 0,
            }}
          >
            <Timer sx={{ fontSize: 22 }} />
            {formatTime(timeLeft)}
          </div>
          <style>{`@keyframes pulse-quiz-timer{0%,100%{opacity:1}50%{opacity:.7}}`}</style>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ height: 8, borderRadius: 4, background: "#f3f4f6", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "width 0.4s ease",
                  background: "linear-gradient(90deg,#b91c1c,#dc2626)",
                  width: `${progress}%`,
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, textAlign: "right" }}>
              {answeredCount}/{total} câu đã trả lời
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={submitQuiz.isPending}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background:
                answeredCount >= total ? "linear-gradient(135deg,#b91c1c,#dc2626)" : "#e5e7eb",
              color: answeredCount >= total ? "#fff" : "#9ca3af",
              fontWeight: 700,
              fontSize: 14,
              cursor: answeredCount >= total ? "pointer" : "not-allowed",
              boxShadow: answeredCount >= total ? "0 4px 12px rgba(185,28,28,0.25)" : "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {submitQuiz.isPending ? (
              <>
                <HourglassEmptyOutlined sx={{ fontSize: 20 }} /> Nộp...
              </>
            ) : (
              <>
                <SendRounded sx={{ fontSize: 20 }} /> Nộp bài
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ ...centeredInner(CONTENT_MAX, "28px 24px 48px"), flex: 1 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {quiz.questions?.map((q, i) => {
            const answered = selected[q._id] !== undefined;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentQ(i)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  border: "2px solid",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: currentQ === i ? "#dc2626" : answered ? "rgba(185,28,28,0.08)" : "#fff",
                  borderColor: currentQ === i ? "#dc2626" : answered ? "#dc2626" : "#e5e7eb",
                  color: currentQ === i ? "#fff" : answered ? "#b91c1c" : "#9ca3af",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {quiz.questions?.map((q, idx) => (
          <div key={q._id} style={{ display: idx === currentQ ? "block" : "none" }}>
            <div
              style={{
                background: "#fff",
                borderRadius: 24,
                padding: "36px 32px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1.5px solid #f3f4f6",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#b91c1c",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                CÂU {idx + 1} / {total}
              </div>

              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#1a1a1a",
                  margin: "0 0 8px 0",
                  fontFamily: "'Noto Sans SC', sans-serif",
                }}
              >
                {q.chineseText}
              </p>
              {q.vietnameseText && (
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: 15,
                    margin: "0 0 24px 0",
                    fontStyle: "italic",
                  }}
                >
                  {q.vietnameseText}
                </p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = selected[q._id] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelect(q._id, oIdx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: "2px solid",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                        borderColor: isSelected ? "#dc2626" : "#e5e7eb",
                        background: isSelected ? "rgba(185,28,28,0.06)" : "#fafafa",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "#fecaca";
                          e.currentTarget.style.background = "#fff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.background = "#fafafa";
                        }
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 13,
                          background: isSelected ? "#dc2626" : "#e5e7eb",
                          color: isSelected ? "#fff" : "#6b7280",
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span
                        style={{
                          fontSize: 15,
                          color: isSelected ? "#b91c1c" : "#374151",
                          fontWeight: isSelected ? 700 : 400,
                        }}
                      >
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "1.5px solid #e5e7eb",
                  background: "#fff",
                  color: currentQ === 0 ? "#d1d5db" : "#374151",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: currentQ === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <NavigateBefore fontSize="small" /> Câu trước
              </button>
              {!isLastQ ? (
                <button
                  type="button"
                  onClick={() => setCurrentQ(currentQ + 1)}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#b91c1c,#dc2626)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(185,28,28,0.25)",
                  }}
                >
                  Câu tiếp →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={submitQuiz.isPending}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#14532d,#16a34a)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(22,163,74,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <SendRounded sx={{ fontSize: 22 }} /> Nộp bài
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
