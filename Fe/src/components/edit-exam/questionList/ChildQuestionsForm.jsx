import { Add, Delete } from "@mui/icons-material";
import { useFieldArray } from "react-hook-form";
import OptionsForm from "./OptionsForm";

function ChildQuestionsForm({
  control,
  register,
  errors,
  nestIndex,
  isStartTimeOver,
}) {
  const childQuestionsPath = `questions.${nestIndex}.childQuestions`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: childQuestionsPath,
  });

  const childErrors = errors.questions?.[nestIndex]?.childQuestions;

  return (
    <div className="mt-8 space-y-4">
      <h3 className="mt-4 mb-2 px-4 font-semibold">Câu hỏi con</h3>

      {childErrors?.message && !Array.isArray(childErrors) && (
        <p className="text-sm text-red-500">{childErrors.message}</p>
      )}

      {fields.map((child, cIndex) => (
        <div
          id={`q${nestIndex}_c${cIndex}`}
          key={child.id}
          className="mt-6 ml-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"
        >
          <div
            id={`question_${cIndex}`}
            className="mb-4 flex items-center justify-between gap-2"
          >
            <span className="text-lg font-bold text-primary">
              Câu {cIndex + 1}:
            </span>
            <button
              type="button"
              onClick={() => remove(cIndex)}
              className={`second-btn flex items-center gap-2 ${
                isStartTimeOver ? "cursor-not-allowed text-gray-400" : ""
              }`}
              aria-label={`Remove Child Question ${cIndex + 1}`}
              disabled={isStartTimeOver}
            >
              <Delete fontSize="small" /> Xóa câu hỏi {cIndex + 1}
            </button>
          </div>

          {/* Nội dung câu hỏi con */}
          <input
            {...register(`${childQuestionsPath}.${cIndex}.content`)}
            placeholder={`Nội dung câu hỏi ${cIndex + 1}`}
            className="w-full rounded border border-gray-300 p-3"
            disabled={isStartTimeOver}
          />
          {childErrors?.[cIndex]?.content && (
            <p className="mb-2 text-sm text-red-500">
              {childErrors[cIndex].content.message}
            </p>
          )}

          {childErrors?.[cIndex]?.correctAnswer && (
            <p className="mb-2 text-sm text-red-500">
              {childErrors[cIndex].correctAnswer.message}
            </p>
          )}

          {/* Đáp án */}
          <OptionsForm
            control={control}
            register={register}
            errors={errors}
            qIndex={nestIndex}
            cIndex={cIndex}
            isStartTimeOver={isStartTimeOver}
          />
        </div>
      ))}

      {/* Add Child Question Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            append({
              id: "",
              content: "",
              correctAnswer: "",
              options: [],
            })
          }
          className={`flex items-center gap-2 rounded-md bg-blue-100 px-4 py-3 text-blue-700 duration-150 hover:bg-blue-200 ${
            isStartTimeOver ? "cursor-not-allowed text-gray-400" : ""
          }`}
          disabled={isStartTimeOver}
        >
          <Add fontSize="small" /> Thêm câu hỏi
        </button>
      </div>
    </div>
  );
}

export default ChildQuestionsForm;