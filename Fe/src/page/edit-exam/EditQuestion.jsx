// src/page/edit-exam/EditQuestion.jsx
import QuestionInputForm from "@/components/edit-exam/QuestionInputForm";
import { ArrowBack } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

function EditQuestion({ isRevisionMode = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  // Cho phép 2 kiểu:
  // 1) state = question (HSK parent: có childQuestions / parentQuestion / imgUrl ...)
  // 2) state = { question, ... } (trong đó question là object thật)
  const question =
    state?.childQuestions || state?.parentQuestion || state?.content
      ? state
      : state.question || null;

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4">
        <button
          className="rounded-full p-2 text-primary shadow-sm hover:bg-gray-100"
          onClick={() => navigate(-1)}
          title="Quay lại"
          type="button"
        >
          <ArrowBack />
        </button>
        <div>
          <label className="text-2xl font-bold text-primary">
            Chỉnh sửa câu hỏi
          </label>
          {/* Sub title: show nhanh nội dung câu 1 nếu là HSK */}
          {question?.childQuestions?.[0]?.content && (
            <p className="mt-1 italic text-gray-500 line-clamp-2">
              {question.childQuestions[0].content}
            </p>
          )}
          {!question?.childQuestions && question?.content && (
            <p className="mt-1 italic text-gray-500 line-clamp-2">
              {question.content}
            </p>
          )}
        </div>
      </div>

      <hr className="my-4" />

      {/* Form sửa câu hỏi – UI bên trong đã giống HSKPreview (ảnh, audio, badge A/B/C, radio...) */}
      <QuestionInputForm
        isRevisionMode={isRevisionMode}
        question={question}
        onSaveCallback={() => navigate(-1, { replace: true })}
      />
    </div>
  );
}

export default EditQuestion;