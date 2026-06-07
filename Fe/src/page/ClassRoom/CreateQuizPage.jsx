import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { quizApi } from "../../hooks/useQuizzes";

function toDatetimeLocalValue(d = new Date(Date.now() + 60 * 60 * 1000)) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyQuestion = () => ({
  chineseText: "",
  vietnameseText: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

export default function CreateQuizPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [opensAtLocal, setOpensAtLocal] = useState(() => toDatetimeLocalValue());
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [activeQ, setActiveQ] = useState(0);

  const updateQuestion = (idx, field, value) =>
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));

  const updateOption = (qIdx, optIdx, value) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...q.options];
        opts[optIdx] = value;
        return { ...q, options: opts };
      })
    );

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
    setActiveQ(questions.length);
  };

  const removeQuestion = (idx) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    setActiveQ(Math.max(0, idx - 1));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Vui lòng nhập tiêu đề bài kiểm tra"); return; }
    const dm = Number(durationMinutes);
    if (!dm || dm < 1 || dm > 480) {
      toast.error("Thời gian làm bài: nhập số phút từ 1 đến 480");
      return;
    }
    const opensAtDate = new Date(opensAtLocal);
    if (Number.isNaN(opensAtDate.getTime())) {
      toast.error("Thời gian mở bài không hợp lệ");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.chineseText.trim()) { toast.error(`Câu ${i + 1}: thiếu nội dung tiếng Trung`); return; }
      if (q.options.some((o) => !o.trim())) { toast.error(`Câu ${i + 1}: điền đủ 4 đáp án`); return; }
    }

    setSaving(true);
    try {
      const quiz = await quizApi.createQuiz({
        title,
        classId,
        questions,
        opensAt: opensAtDate.toISOString(),
        durationMinutes: dm,
      });
      await quizApi.publishQuiz(quiz._id);
      toast.success("🎉 Bài kiểm tra đã được xuất bản!");
      navigate(`/class/${classId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Tạo bài kiểm tra thất bại");
    } finally {
      setSaving(false);
    }
  };

  const completed = questions.filter(
    (q) => q.chineseText.trim() && q.options.every((o) => o.trim())
  ).length;

  return (
    <div style={{
      minHeight: "100vh", width: "100%", flex: 1, boxSizing: "border-box",
      background: "linear-gradient(135deg,#fff7f7 0%,#fff 60%,#f0f4ff 100%)",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
    }}>
      <div style={{ width: "100%", maxWidth: 860, padding: "32px 20px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: "20px 28px",
          marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1.5px solid #f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg,#b91c1c,#dc2626)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 4px 12px rgba(185,28,28,0.3)"
            }}>📝</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
                Tạo bài kiểm tra mới
              </h1>
              <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
                {completed}/{questions.length} câu đã hoàn chỉnh
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "8px 18px", borderRadius: 10, border: "1.5px solid #e5e7eb",
              background: "#fff", color: "#6b7280", fontWeight: 600, fontSize: 13,
              cursor: "pointer"
            }}
          >
            ← Quay lại
          </button>
        </div>

        {/* Title input */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: 24,
          marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1.5px solid #f3f4f6"
        }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>
            Tiêu đề bài kiểm tra <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Kiểm tra từ vựng bài 3 — Gia đình"
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15,
              border: "1.5px solid #e5e7eb", outline: "none", color: "#1a1a1a",
              fontWeight: 500, boxSizing: "border-box", fontFamily: "inherit",
              transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#dc2626"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* Lịch làm bài */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: 24,
          marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1.5px solid #f3f4f6"
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 16px 0" }}>
            ⏱ Lịch mở bài &amp; thời gian làm bài
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 8 }}>
                Thời gian mở bài <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="datetime-local"
                value={opensAtLocal}
                onChange={(e) => setOpensAtLocal(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 14,
                  border: "1.5px solid #e5e7eb", outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "8px 0 0 0" }}>
                Đến thời điểm này học viên mới vào được trang làm bài.
              </p>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 8 }}>
                Thời gian làm bài (phút) <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="number"
                min={1}
                max={480}
                value={durationMinutes}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setDurationMinutes(Number.isFinite(v) ? v : 15);
                }}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 15,
                  border: "1.5px solid #e5e7eb", outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit", fontWeight: 600,
                }}
              />
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "8px 0 0 0" }}>
                Sau khi bấm « Bắt đầu », đếm ngược đến hết là tự nộp và chấm điểm.
              </p>
            </div>
          </div>
        </div>

        {/* Questions list (nav) */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {questions.map((q, i) => {
            const done = q.chineseText.trim() && q.options.every((o) => o.trim());
            return (
              <button
                key={i}
                onClick={() => setActiveQ(i)}
                style={{
                  width: 40, height: 40, borderRadius: 11, border: "2px solid",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
                  background: activeQ === i ? (done ? "#dc2626" : "#6b7280") : "#fff",
                  borderColor: activeQ === i ? (done ? "#dc2626" : "#6b7280") : done ? "#bbf7d0" : "#e5e7eb",
                  color: activeQ === i ? "#fff" : done ? "#16a34a" : "#9ca3af",
                }}
              >
                {i + 1}
              </button>
            );
          })}
          <button
            onClick={addQuestion}
            style={{
              width: 40, height: 40, borderRadius: 11,
              border: "2px dashed #d1d5db", background: "#fafafa",
              color: "#9ca3af", fontWeight: 900, fontSize: 20, cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#dc2626"; e.target.style.color = "#dc2626"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.color = "#9ca3af"; }}
          >+</button>
        </div>

        {/* Active question editor */}
        {questions.map((q, qIdx) => (
          <div
            key={qIdx}
            style={{ display: qIdx === activeQ ? "block" : "none" }}
          >
            <div style={{
              background: "#fff", borderRadius: 20, padding: 28,
              boxShadow: "0 4px 16px rgba(185,28,28,0.08)",
              border: "2px solid rgba(185,28,28,0.15)",
              marginBottom: 20
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: "#b91c1c",
                  background: "rgba(185,28,28,0.08)", padding: "4px 14px", borderRadius: 999
                }}>
                  Câu hỏi {qIdx + 1} / {questions.length}
                </span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIdx)}
                    style={{
                      padding: "6px 14px", borderRadius: 9, border: "1.5px solid #fecaca",
                      background: "#fff5f5", color: "#dc2626",
                      fontWeight: 600, fontSize: 12, cursor: "pointer"
                    }}
                  >
                    🗑 Xóa câu
                  </button>
                )}
              </div>

              {/* Chinese text */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  Nội dung tiếng Trung <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  value={q.chineseText}
                  onChange={(e) => updateQuestion(qIdx, "chineseText", e.target.value)}
                  placeholder="VD: 你好是什么意思？"
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12,
                    border: "1.5px solid #e5e7eb", fontSize: 16,
                    fontFamily: "'Noto Sans SC', sans-serif", color: "#1a1a1a",
                    outline: "none", boxSizing: "border-box", fontWeight: 500,
                    transition: "border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor = "#dc2626"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              {/* Vietnamese hint */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  Gợi ý tiếng Việt <span style={{ color: "#9ca3af", fontWeight: 400 }}>(tùy chọn)</span>
                </label>
                <input
                  value={q.vietnameseText}
                  onChange={(e) => updateQuestion(qIdx, "vietnameseText", e.target.value)}
                  placeholder="VD: Câu hỏi: ... có nghĩa là gì?"
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12,
                    border: "1.5px solid #e5e7eb", fontSize: 14,
                    color: "#374151", outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s", fontFamily: "inherit"
                  }}
                  onFocus={e => e.target.style.borderColor = "#dc2626"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              {/* Options */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>
                  Đáp án — Click vào ô để chọn đáp án đúng
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctIndex === oIdx;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px", borderRadius: 14, cursor: "pointer",
                          border: `2px solid ${isCorrect ? "#16a34a" : "#e5e7eb"}`,
                          background: isCorrect ? "rgba(22,163,74,0.06)" : "#fafafa",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, fontSize: 13,
                          background: isCorrect ? "#16a34a" : "#e5e7eb",
                          color: isCorrect ? "#fff" : "#6b7280"
                        }}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <input
                          type="text"
                          value={opt}
                          placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                          onChange={(e) => { e.stopPropagation(); updateOption(qIdx, oIdx, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1, background: "transparent", border: "none",
                            outline: "none", fontSize: 14, color: "#1a1a1a",
                            fontFamily: "inherit", fontWeight: isCorrect ? 600 : 400
                          }}
                        />
                        {isCorrect && <span style={{ color: "#16a34a", fontWeight: 900 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button
                  onClick={() => setActiveQ(Math.max(0, qIdx - 1))}
                  disabled={qIdx === 0}
                  style={{
                    padding: "8px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb",
                    background: "#fff", color: qIdx === 0 ? "#d1d5db" : "#374151",
                    fontWeight: 600, fontSize: 14, cursor: qIdx === 0 ? "not-allowed" : "pointer"
                  }}
                >
                  ← Trước
                </button>
                <button
                  onClick={() => qIdx === questions.length - 1 ? addQuestion() : setActiveQ(qIdx + 1)}
                  style={{
                    padding: "8px 20px", borderRadius: 10,
                    border: "1.5px solid #dc2626",
                    background: qIdx === questions.length - 1 ? "rgba(220,38,38,0.06)" : "#fff",
                    color: "#dc2626", fontWeight: 600, fontSize: 14, cursor: "pointer"
                  }}
                >
                  {qIdx === questions.length - 1 ? "+ Thêm câu" : "Tiếp →"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Submit */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1.5px solid #f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16
        }}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>
            <strong style={{ color: completed === questions.length ? "#16a34a" : "#6b7280" }}>
              {completed}/{questions.length}
            </strong> câu đã hoàn chỉnh
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || completed < questions.length || !title.trim()}
            style={{
              padding: "12px 32px", borderRadius: 12, border: "none",
              background: saving || completed < questions.length || !title.trim()
                ? "#e5e7eb"
                : "linear-gradient(135deg,#b91c1c,#dc2626)",
              color: saving || completed < questions.length || !title.trim() ? "#9ca3af" : "#fff",
              fontWeight: 700, fontSize: 15, cursor: saving ? "wait" : "pointer",
              boxShadow: saving || completed < questions.length || !title.trim()
                ? "none"
                : "0 4px 16px rgba(185,28,28,0.3)",
              transition: "all 0.2s"
            }}
          >
            {saving ? "⏳ Đang xuất bản..." : "🚀 Xuất bản bài kiểm tra"}
          </button>
        </div>
      </div>
    </div>
  );
}
