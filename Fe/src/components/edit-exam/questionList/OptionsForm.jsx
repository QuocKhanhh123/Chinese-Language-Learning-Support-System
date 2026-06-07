import { Add, Delete } from "@mui/icons-material";
import { useFieldArray } from "react-hook-form";

const generateOptionId = (index) => {
  return String.fromCharCode(97 + index); // a,b,c...
};

function OptionsForm({
  control,
  register,
  errors,
  qIndex,
  cIndex,
  isStartTimeOver,
}) {
  const optionsPath = `questions.${qIndex}.childQuestions.${cIndex}.options`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: optionsPath,
  });

  const optionsErrors =
    errors.questions?.[qIndex]?.childQuestions?.[cIndex]?.options;

  return (
    <div className="mt-8 space-y-2 pl-4">
      <h4 className="mb-2 font-medium">Đáp án</h4>

      {optionsErrors?.message && !Array.isArray(optionsErrors) && (
        <p className="text-sm text-red-500">{optionsErrors.message}</p>
      )}

      {fields.map((opt, oIndex) => (
        <div
          key={opt.id}
          className="flex items-center gap-4 border-b border-gray-200 pb-2"
        >
          {/* label a./b./c. */}
          <span className="w-5 text-center font-medium text-gray-600">
            {generateOptionId(oIndex)}.
          </span>

          {/* text answer */}
          <div className="flex-1">
            <input
              type="text"
              {...register(`${optionsPath}.${oIndex}.text`)}
              placeholder={`Đáp án ${oIndex + 1}`}
              className="w-full rounded border border-gray-300 px-4 py-2"
              disabled={isStartTimeOver}
            />
            {optionsErrors?.[oIndex]?.text && (
              <p className="mt-1 text-sm text-red-500">
                {optionsErrors[oIndex].text.message}
              </p>
            )}
          </div>

          {/* radio pick correct */}
          <input
            type="radio"
            {...register(
              `questions.${qIndex}.childQuestions.${cIndex}.correctAnswer`
            )}
            value={generateOptionId(oIndex)}
            className="h-4 w-4 rounded-full border-gray-300 text-teal-600 focus:ring-teal-500"
            disabled={isStartTimeOver}
          />

          {/* delete option */}
          <button
            type="button"
            onClick={() => remove(oIndex)}
            className={`text-gray-400 hover:text-red-700 ${
              isStartTimeOver ? "cursor-not-allowed" : ""
            }`}
            disabled={isStartTimeOver}
          >
            <Delete fontSize="small" />
          </button>
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={fields.length >= 4 || isStartTimeOver}
          onClick={() =>
            append({
              id: generateOptionId(fields.length),
              text: "",
            })
          }
          className={`flex items-center gap-2 text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-600 ${
            isStartTimeOver ? "cursor-not-allowed text-gray-400" : ""
          }`}
        >
          <Add fontSize="small" /> Thêm đáp án
        </button>
      </div>
    </div>
  );
}

export default OptionsForm;