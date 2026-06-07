import axiosInstance from "@/network/httpRequest";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ArrowBack } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ReportDetails() {
  const { examId, studentId } = useParams();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const navigate = useNavigate();

  /* ======================================================
      API: LẤY KẾT QUẢ CHI TIẾT 1 HỌC VIÊN
  ======================================================= */
  const getStudentResult = async () => {
    const res = await axiosInstance.get(
      `/exams/${examId}/student/${studentId}/result`
    );
    console.log("🔥 FULL RESPONSE:", res);
    return res.data.data;
  };
  
  const {
    data: studentData,
    isLoading: studentLoading,
    isError: studentError,
  } = useQuery({
    queryKey: ["student-result", examId, studentId],
    queryFn: getStudentResult,
  });
  
  // tránh crash
  console.log("studentData", studentData?.answers?.[0]?.childAnswers?.[0]);
  
  /* ======================================================
      API: LẤY THỐNG KÊ GIÁO VIÊN
  ======================================================= */
  const getTeacherStats = async () => {
    const res = await axiosInstance.get(`/exams/${examId}/teacher-stats`);
    return res.data.data;
  };

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["teacher-stats", examId],
    queryFn: getTeacherStats,
  });

  if (studentLoading || statsLoading) return <div>Đang tải...</div>;
  if (studentError || statsError) return <div>Lỗi tải dữ liệu.</div>;

  // Thống kê
  const { statistics = {} } = stats ?? {};
  const { totalAttempts, averageScore, highestScore, passRate } = statistics;

  // Student data
  const { user, score, timeSpentMinutes, answers } = studentData;

  const totalScore = score.totalPoints;
  const maxScore = score.maxPoints;
  const percentage = score.percentage;
  const isPassed = score.passed;

  const handleOpenModal = (question) => {
    setSelectedQuestion(question);
    open();
  };

  return (
    <div className="p-6">
      {/* BACK BUTTON */}
      <div className="flex items-center gap-4 mb-4">
        <button
          className="p-2 text-primary rounded-full shadow-sm hover:bg-gray-100"
          onClick={() => navigate(-1)}
        >
          <ArrowBack />
        </button>
        <h1 className="text-2xl font-bold">Chi tiết bài làm</h1>
      </div>

      {/* ============================
            TEACHER EXAM STATISTICS
      ============================ */}
      <div className="p-4 rounded-xl bg-gray-50 border mb-6">
        <h2 className="text-xl font-semibold text-primary mb-2">📊 Thống kê</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Tổng lượt làm" value={totalAttempts} />
          <StatBox label="Điểm trung bình" value={averageScore?.toFixed(1)} />
          <StatBox label="Điểm cao nhất" value={highestScore} />
          <StatBox label="Tỉ lệ đạt" value={`${passRate?.toFixed(1)}%`} />
        </div>
      </div>

      {/* ============================
            STUDENT INFO
      ============================ */}
      <div className="my-4">
        <h2 className="text-xl font-semibold text-primary mb-3">
          🧑‍🎓 Thông tin học viên
        </h2>

        <p>
          <strong>Tên:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Thời gian làm:</strong> {timeSpentMinutes} phút
        </p>

        <p className="mt-2">
          <strong>Điểm:</strong> {totalScore} / {maxScore}{" "}
          <span className={isPassed ? "text-green-600" : "text-red-600"}>
            ({percentage}%)
          </span>
        </p>
      </div>

      {/* ============================
            STUDENT ANSWERS
      ============================ */}
      <div>
        <h2 className="text-xl font-semibold text-primary mb-4">
          📝 Chi tiết câu trả lời
        </h2>

        {answers.map((part, i) => (
          <div key={i} className="mb-6 border-b pb-4">
            <h3 className="font-semibold mb-2 text-lg">
              {`Phần ${i + 1} – ${part.sectionTitle}`}
            </h3>

            <div className="flex gap-3 flex-wrap">
              {part.childAnswers.map((child, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenModal(child)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                    child.isCorrect
                      ? "border-green-500 bg-green-100"
                      : "border-red-500 bg-red-100"
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ============================
            QUESTION MODAL
      ============================ */}
      <Modal opened={opened} onClose={close} size={800}>
        {selectedQuestion && (
          <div className="text-lg px-6 pb-6">
            <p
              className={`px-4 py-1 rounded-full w-fit text-white mb-4 ${
                selectedQuestion.isCorrect ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {selectedQuestion.isCorrect ? "Đúng" : "Sai"}
            </p>

            {/* CONTENT */}
            <p className="mb-4">{selectedQuestion.content}</p>

            {/* IMAGE */}
            {selectedQuestion.imageUrl && (
              <img
                src={selectedQuestion.imageUrl}
                alt="question"
                className="w-64 mb-4 rounded shadow"
              />
            )}

            {/* OPTIONS */}
            {selectedQuestion.options.map((opt, idx) => {
              const userAns = selectedQuestion.answer?.toLowerCase();
              const correctAns = selectedQuestion.correctAnswer?.toLowerCase();

              const isUser = opt.id === userAns;
              const isCorrect = opt.id === correctAns;

              return (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isCorrect
                        ? "border-green-500"
                        : isUser
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isUser && (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                    )}
                  </span>

                  <span className={isCorrect ? "text-green-600 font-bold" : ""}>
                    {opt.id.toUpperCase()}. {opt.text}
                  </span>
                </div>
              );
            })}

            {/* CORRECT ANSWER */}
            {!selectedQuestion.isCorrect && (
              <p className="mt-4 text-green-600 font-bold">
                Đáp án đúng: {selectedQuestion.correctAnswer?.toUpperCase()}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

const StatBox = ({ label, value }) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <p className="font-bold text-gray-700">{label}</p>
    <p className="text-xl font-bold text-primary">{value ?? 0}</p>
  </div>
);

export default ReportDetails;
