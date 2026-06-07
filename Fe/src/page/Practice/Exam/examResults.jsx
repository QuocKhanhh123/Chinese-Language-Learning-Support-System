// src/page/Practice/Exam/examResults.jsx
import { useExamResult } from "@/hooks/useExam";
import { useNavigate, useParams } from "react-router-dom";
import {
  Modal,
  Button,
  Paper,
  Text,
  Title,
  Badge,
  Group,
  Container,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState, useMemo } from "react";

const normalizeOption = (opt, idx) => {
  const labels = ["A", "B", "C", "D", "E", "F"];

  if (typeof opt === "string") {
    const m = opt.match(/^([A-Fa-f])\s*[.\uFF0E、)]?\s*(.+)$/);
    if (m) {
      return {
        id: m[1].toLowerCase(),
        text: m[2].trim(),
      };
    }
    return {
      id: labels[idx].toLowerCase(),
      text: opt,
    };
  }

  return {
    id: (opt.id && String(opt.id).toLowerCase()) || labels[idx].toLowerCase(),
    text: opt.text || "",
  };
};

const skillLabel = (skill) => {
  if (skill === "listening") return "听力 · Nghe";
  if (skill === "reading") return "阅读 · Đọc";
  if (skill === "writing" || skill === "writing_essay") return "写作 · Viết";
  return skill;
};

const skillColor = (skill) => {
  if (skill === "listening") return "#0ea5e9"; // cyan/sky
  if (skill === "reading") return "#22c55e"; // green
  if (skill === "writing" || skill === "writing_essay") return "#f97316"; // orange
  return "#6b7280"; // gray
};

const ExamResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const { data: result, isLoading } = useExamResult(attemptId);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // --------- MERGE SECTIONS + CÂU HỎI ĐỂ HIỆN KẾT QUẢ ----------
  const mergedSections = useMemo(() => {
    const exam = result?.exam;
    const sectionResults = result?.sectionResults || [];

    if (!exam || !Array.isArray(exam.sections)) return [];

    let globalIndex = 1;

    return exam.sections.map((section, sIdx) => {
      const sr =
        sectionResults.find((r) => r.skill === section.skill) ||
        sectionResults[sIdx];

      const questions = (section.questions || []).map((q, qIdx) => {
        const ansRec = sr?.answers?.[qIdx] || {};

        const qOptions = (q.options || []).map((o, idx) =>
          normalizeOption(o, idx)
        );

        const userAnswer = ansRec.answer || "";
        const correctAnswer = (q.correctAnswer || "").toString();
        const isCorrect = !!ansRec.isCorrect;
        const pointsEarned = ansRec.pointsEarned ?? 0;

        const imgSrc =
          q.imageUrl ||
          q.imgUrl ||
          (Array.isArray(q.imageUrls) && q.imageUrls[0]) ||
          "";

        const uiQuestion = {
          _id: ansRec.questionId || q._id || `${section.skill}-${qIdx}`,
          globalIndex: globalIndex++,
          sectionSkill: section.skill,
          content: q.content || "",
          options: qOptions,
          correctAnswer,
          userAnswer,
          isCorrect,
          score: pointsEarned,
          imageUrl: imgSrc,
        };

        return uiQuestion;
      });

      return {
        id: section._id || `${section.skill}-${sIdx}`,
        skill: section.skill,
        title: section.title || section.skill,
        questions,
      };
    });
  }, [result]);

  // --------- INFO TỔNG QUAN ----------
  const exam = result?.exam;
  const score = result?.score || {};
  const skillScores = result?.skillScores || null;
  const timeSpentMinutes = result?.timeSpentMinutes;

  const totalScore = score.totalPoints ?? 0;
  const maxPoints = score.maxPoints ?? 0;
  const percentage = score.percentage ?? 0;
  const passed = !!score.passed;

  const openModal = (question) => {
    setSelectedQuestion(question);
    open();
  };

  // --------- LOADING / NOT FOUND ----------
  if (isLoading) {
    return (
      <div className="py-10 text-center text-gray-500">Đang tải kết quả...</div>
    );
  }

  if (!result) {
    return (
      <div className="py-10 text-center text-red-600">
        Không tìm thấy kết quả bài thi
      </div>
    );
  }

  return (
    <Container size="lg" px="sm" className="py-8">
      <Paper
        shadow="md"
        radius="lg"
        p="lg"
        withBorder
        className="bg-white/90 backdrop-blur-sm"
      >
        {/* HEADER ĐỀ THI */}
        <div className="mb-6 border-b border-gray-100 pb-4">
          <Title
            order={2}
            align="center"
            className="mb-2 text-2xl font-bold text-[#111827]"
          >
            Kết quả HSK –{" "}
            <span className="text-[#dc2626]">{exam?.title || ""}</span>
          </Title>
          <Text size="sm" c="dimmed" align="center">
            {exam?.level || "HSK"} • Số câu: {exam?.totalPoints} 
          </Text>
        </div>

        {/* TỔNG QUAN ĐIỂM + TRẠNG THÁI */}
        <Group
          position="center"
          spacing="xl"
          grow
          className="mb-8 rounded-2xl bg-[#f9fafb] px-4 py-5 shadow-inner"
        >
          <div className="flex flex-col items-center gap-1">
            <Text size="sm" c="gray.7" fw={500}>
              Số câu
            </Text>
            <Text
              size="xl"
              fw={800}
              className="rounded-full bg-emerald-50 px-4 py-1 text-emerald-600"
            >
              {totalScore} / {maxPoints}
            </Text>
            <Text size="sm" c="gray.6">
              {typeof percentage === "number"
                ? `${percentage.toFixed(1)}%`
                : `${percentage}%`}
            </Text>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Text size="sm" c="gray.7" fw={500}>
              Thời gian làm bài
            </Text>
            <Text
              size="xl"
              fw={800}
              className="rounded-full bg-rose-50 px-4 py-1 text-rose-600"
            >
              {typeof timeSpentMinutes === "number"
                ? `${timeSpentMinutes} phút`
                : "Không xác định"}
            </Text>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Text size="sm" c="gray.7" fw={500}>
              Trạng thái
            </Text>
            <Badge
              color={passed ? "green" : "red"}
              size="lg"
              radius="xl"
              className="px-4 py-1 text-sm"
              variant="filled"
            >
              {passed ? "Đạt" : "Chưa đạt"}
            </Badge>
          </div>
        </Group>

        {/* ĐIỂM THEO KỸ NĂNG */}
        {skillScores && (
          <div className="mb-6 rounded-2xl border border-gray-100 bg-[#fefce8] px-4 py-3">
            <Text fw={600} size="xl" className="mb-2 text-[#854d0e]">
              Điểm theo kỹ năng
            </Text>
            <Group position="center" spacing="xl" grow>
              <div className="text-center">
                <Text size="xm" c="gray.6">
                  听力 · Nghe
                </Text>
                <Text fw={700}>{skillScores.listening ?? 0}</Text>
              </div>
              <div className="text-center">
                <Text size="xm" c="gray.6">
                  阅读 · Đọc
                </Text>
                <Text fw={700}>{skillScores.reading ?? 0}</Text>
              </div>
              <div className="text-center">
                <Text size="xm" c="gray.6">
                  写作 · Viết
                </Text>
                <Text fw={700}>{skillScores.writing ?? 0}</Text>
              </div>
            </Group>
          </div>
        )}

        <Divider my="sm" />

        {/* LIST CÂU HỎI THEO SECTION / SKILL */}
        {mergedSections.map((section) => (
          <div key={section.id} className="mt-6">
            {/* Title section giống block HSK */}
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-7 w-1.5 rounded-full"
                style={{ backgroundColor: skillColor(section.skill) }}
              />
              <div className="flex flex-col">
                <Text fw={700} size="sm">
                  {skillLabel(section.skill)}
                </Text>
                <Text size="xs" c="gray.5">
                  {section.questions.length} câu
                </Text>
              </div>
            </div>

            {/* Grid câu hỏi nhỏ nhỏ kiểu card */}
            <div className="grid gap-3 md:grid-cols-2">
              {section.questions.map((q) => (
                <Paper
                  key={q._id}
                  p="sm"
                  radius="md"
                  withBorder
                  className={`cursor-pointer border transition hover:-translate-y-0.5 hover:shadow-md ${
                    q.isCorrect
                      ? "border-emerald-200 bg-emerald-50/60"
                      : "border-rose-200 bg-rose-50/60"
                  }`}
                  onClick={() => openModal(q)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          q.isCorrect
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {q.globalIndex}
                      </div>
                      <div>
                    
                        <Text size="xm" c="gray.6" className="mt-1">
                          {q.isCorrect ? "Trả lời đúng" : "Trả lời sai"} ·{" "}
                          <span className="font-semibold">
                            {q.score} điểm
                          </span>
                        </Text>
                      </div>
                    </div>
                  </div>
                </Paper>
              ))}
            </div>
          </div>
        ))}

        {/* NÚT ACTION CUỐI TRANG */}
        <Group mt="xl" position="center" grow>
          <Button
            color="gray"
            variant="outline"
            radius="xl"
            onClick={() => navigate("/practice/exam")}
          >
            🔙 Quay lại danh sách
          </Button>
          <Button
            color="red"
            radius="xl"
            onClick={() => navigate(`/practice/exam/${exam?._id}`)}
          >
            📄 Xem chi tiết đề thi
          </Button>
        </Group>
      </Paper>

      {/* MODAL CHI TIẾT CÂU HỎI – STYLE HSK */}
      <Modal
        size={800}
        opened={opened}
        onClose={close}
        radius="lg"
        centered
        overlayProps={{ opacity: 0.25, blur: 2 }}
      >
        {selectedQuestion && (
          <div className="overflow-hidden rounded-2xl bg-white">
            {/* Header bar */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#ef4444] to-[#f97316] px-5 py-3 text-white">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80">
                  HSK – {skillLabel(selectedQuestion.sectionSkill)}
                </p>
                <p className="text-lg font-semibold">
                  Câu {selectedQuestion.globalIndex}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80">Điểm đạt được</p>
                <p className="text-lg font-bold">
                  {selectedQuestion.score ?? 0} điểm
                </p>
              </div>
            </div>

            <div className="px-5 py-4">
              {/* Tag Đúng / Sai */}
              {selectedQuestion.isCorrect ? (
                <p className="mb-4 inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  ✅ Trả lời đúng
                </p>
              ) : (
                <p className="mb-4 inline-flex rounded-full bg-rose-100 px-4 py-1 text-xs font-bold uppercase tracking-wide text-rose-700">
                  ❌ Trả lời sai
                </p>
              )}

              {/* Nếu có ảnh thì show trên, giống đề HSK thật */}
              {selectedQuestion.imageUrl && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={selectedQuestion.imageUrl}
                    alt={`Q${selectedQuestion.globalIndex}`}
                    className="max-h-64 rounded-md border border-gray-200 object-contain"
                  />
                </div>
              )}

              {/* Nội dung câu hỏi */}
              {selectedQuestion.content && (
                <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                  {selectedQuestion.content}
                </p>
              )}

              {(() => {
                // ====== normalize options giống QuestionSection ======
                const optionLabels = ["A", "B", "C", "D", "E", "F"];

                const normalizeOptionLocal = (opt, idx) => {
                  if (typeof opt === "string") {
                    const m = opt.match(/^([A-Fa-f])\s*[.\uFF0E、)]?\s*(.+)$/);
                    if (m) {
                      return {
                        id: m[1].toLowerCase(),
                        text: m[2].trim(),
                      };
                    }
                    return {
                      id: optionLabels[idx].toLowerCase(),
                      text: opt,
                    };
                  }

                  return {
                    id:
                      (opt.id && String(opt.id).toLowerCase()) ||
                      optionLabels[idx].toLowerCase(),
                    text: opt.text || "",
                  };
                };

                const normalizedOptions = (selectedQuestion.options || []).map(
                  (opt, idx) => normalizeOptionLocal(opt, idx)
                );

                const user = (selectedQuestion.userAnswer || "")
                  .toString()
                  .trim()
                  .toLowerCase();
                const correct = (selectedQuestion.correctAnswer || "")
                  .toString()
                  .trim()
                  .toLowerCase();

                // ================== CÓ OPTIONS → multiple choice / Đúng Sai ==================
                if (normalizedOptions.length > 0) {
                  return (
                    <>
                      <div className="mt-2 flex flex-col gap-2">
                        {normalizedOptions.map((option, index) => {
                          const id = option.id; // đã là lower-case
                          const isUserAnswer = id === user;
                          const isCorrectAnswer = id === correct;
                          const isWrongAnswer =
                            isUserAnswer && !isCorrectAnswer;

                          return (
                            <div
                              key={index}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                                isCorrectAnswer
                                  ? "border-emerald-300 bg-emerald-50"
                                  : isWrongAnswer
                                  ? "border-rose-300 bg-rose-50"
                                  : "border-gray-200"
                              }`}
                            >
                              {/* vòng tròn trạng thái */}
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                                  isCorrectAnswer
                                    ? "border-emerald-500 text-emerald-600"
                                    : isWrongAnswer
                                    ? "border-rose-500 text-rose-600"
                                    : "border-gray-300 text-gray-500"
                                }`}
                              >
                                {option.id.toUpperCase()}
                              </span>

                              {/* text đáp án */}
                              <span
                                className={`whitespace-pre-wrap ${
                                  isCorrectAnswer
                                    ? "font-semibold text-emerald-700"
                                    : isWrongAnswer
                                    ? "font-semibold text-rose-700"
                                    : "text-gray-800"
                                }`}
                              >
                                {option.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* dòng “Đáp án đúng là …” nếu làm sai */}
                      {!selectedQuestion.isCorrect && correct && (
                        <p className="mt-4 text-sm font-semibold text-emerald-700">
                          Đáp án đúng là: {correct.toUpperCase()}
                        </p>
                      )}
                    </>
                  );
                }

                // ================== KHÔNG CÓ OPTIONS → điền A–F / viết câu / viết Hán tự ==================
                return (
                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Câu trả lời của bạn: </span>
                      {selectedQuestion.userAnswer
                        ? selectedQuestion.userAnswer
                        : "(bỏ trống)"}
                    </p>
                    <p className="font-semibold text-emerald-700">
                      Đáp án đúng: {selectedQuestion.correctAnswer || "—"}
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end border-t border-gray-100 px-5 py-3">
              <Button variant="subtle" color="gray" radius="xl" onClick={close}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Container>
  );
};

export default ExamResultPage;