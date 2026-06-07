/* eslint-disable react-hooks/exhaustive-deps */
import { saveQuestions } from "@/components/edit-exam/api/questionService";
import { formSchema } from "@/components/edit-exam/questionList/schemaValidate";
import useFetchExamData from "@/hooks/useFetchExamData";
import { zodResolver } from "@hookform/resolvers/zod";
import { Progress } from "@mantine/core";
import { Add, ArrowBack, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import OptionsForm from "@/components/edit-exam/questionList/OptionsForm";
import { uploadImage } from "../../utils/firebase/firebaseUtils";

// helper tạo id đáp án a,b,c,...
const generateOptionId = (index) => String.fromCharCode(97 + index);

// Chuẩn hoá content: nếu là [EMPTY CONTENT X] thì coi như rỗng khi load
const normalizeChildContent = (content) => {
  if (!content) return "";
  const trimmed = String(content).trim();
  if (trimmed.startsWith("[EMPTY CONTENT")) return "";
  return content;
};

// Chuẩn hoá dữ liệu từ BE để radio tick đúng, id = a/b/c, correctAnswer = a/b/c
const normalizeQuestionsFromBE = (questions = []) =>
  questions.map((parent) => ({
    ...parent,
    childQuestions: (parent.childQuestions || []).map((child) => {
      const normalizedOptions = (child.options || []).map((opt, oIndex) => {
        const id = (opt.id || generateOptionId(oIndex)).toLowerCase();
        // Đảm bảo luôn có field text cho Zod (optionSchema.text)
        const text = opt.text || opt.content || "";
        return { ...opt, id, text };
      });

      return {
        ...child,
        content: normalizeChildContent(child.content),
        options: normalizedOptions,
        correctAnswer: (child.correctAnswer || "").toLowerCase(),
      };
    }),
  }));

// ===== helper: lấy số câu global từ parentQuestion (Câu 1..80) =====
const getGlobalQuestionNo = (parentQuestion) => {
  if (!parentQuestion) return null;
  const m = String(parentQuestion).match(/Câu\s*(\d+)/i);
  if (!m) return null;
  const no = parseInt(m[1], 10);
  return Number.isNaN(no) ? null : no;
};

// ===== CUSTOM RESOLVER: Điều chỉnh dữ liệu theo từng phần HSK trước khi validate =====
const baseResolver = zodResolver(formSchema);

const editHSKResolver = async (values, context, options) => {
  const cloned = {
    ...values,
    questions: (values.questions || []).map((q) => {
      const parentTitle = q.parentQuestion || "";
      const globalNo = getGlobalQuestionNo(parentTitle);

      const isListening = globalNo !== null && globalNo >= 1 && globalNo <= 35;
      const isListeningLetterBank =
        globalNo !== null && globalNo >= 11 && globalNo <= 20; // nghe 11–20: chọn A–F

      const isReading1 = globalNo !== null && globalNo >= 36 && globalNo <= 40;
      const isReading2 = globalNo !== null && globalNo >= 41 && globalNo <= 45;
      const isReading3 = globalNo !== null && globalNo >= 46 && globalNo <= 50;
      const isReading4 = globalNo !== null && globalNo >= 51 && globalNo <= 60;
      const isReading5 = globalNo !== null && globalNo >= 61 && globalNo <= 70;
      const isWriting = globalNo !== null && globalNo >= 71 && globalNo <= 80;

      const isLetterOnlyBankSection =
        isListeningLetterBank || isReading1 || isReading2 || isReading4;

      return {
        ...q,
        childQuestions: (q.childQuestions || []).map((c, cIndex) => {
          let next = { ...c };

          const hasContent =
            next.content && String(next.content).trim().length > 0;
          const hasImage = !!(next.imgUrl || q.imgUrl);

          // 1) Phần nghe + các phần bank chữ: cho phép content rỗng
          // => chuyển thành [EMPTY CONTENT X] để pass schema
          if (!hasContent && (isListening || hasImage || isLetterOnlyBankSection)) {
            next.content = `[EMPTY CONTENT ${cIndex + 1}]`;
          }

          // 2) Phần viết 71–80:
          //    - formSchema bắt options & correctAnswer nên bơm dummy
          if (isWriting) {
            // ít nhất 2 option dummy để pass .min(2)
            if (!next.options || next.options.length < 2) {
              next.options = [
                { id: "a", text: "WRITING_MANUAL_GRADE_1" },
                { id: "b", text: "WRITING_MANUAL_GRADE_2" },
              ];
            }

            if (!next.correctAnswer || !String(next.correctAnswer).trim()) {
              // nếu GV không nhập đáp án mẫu, đặt giá trị placeholder
              next.correctAnswer = "WRITING_MANUAL_GRADE";
            }

            return next;
          }

          // 3) Các phần dùng bank chữ (A–F) mà không có options:
          //    - Nghe 11–20, Đọc 36–40, 41–45, 51–60
          if (isLetterOnlyBankSection) {
            const letters = ["a", "b", "c", "d", "e", "f"];

            // Nếu options trống hoặc < 2, bơm bank A–F với field text
            if (!next.options || next.options.length < 2) {
              next.options = letters.map((l) => ({
                id: l,
                text: l.toUpperCase(),
              }));
            }

            if (next.correctAnswer) {
              const key = String(next.correctAnswer).trim().toLowerCase();
              if (letters.includes(key)) {
                next.correctAnswer = key;
              }
            }

            return next;
          }

          // 4) Phần Đúng/Sai 46–50: đảm bảo vẫn có 2 options để pass schema
          if (isReading3) {
            if (!next.options || next.options.length < 2) {
              next.options = [
                { id: "a", text: "✓" },
                { id: "b", text: "×" },
              ];
            }

            const raw = String(next.correctAnswer || "").trim();
            if (["✓", "对", "a", "A", "1"].includes(raw)) {
              next.correctAnswer = "✓";
            } else if (["×", "错", "b", "B", "x", "X", "0"].includes(raw)) {
              next.correctAnswer = "×";
            }

            return next;
          }

          // 5) Các phần khác giữ nguyên (nghe 1–10, 21–35, đọc 61–70...)
          return next;
        }),
      };
    }),
  };

  return baseResolver(cloned, context, options);
};

function EditListQuestion() {
  const { examId } = useParams();
  const location = useLocation();
  const isStartTimeOver = location.state;
  const navigate = useNavigate();

  const [imgUrls, setImgUrls] = useState({});
  const [audioUrl, setAudioUrl] = useState({});
  const [childImgUrls, setChildImgUrls] = useState({});
  const [progress, setProgress] = useState();

  const { data: examData } = useFetchExamData(examId);

  // CHỈ cho sửa nội dung, không cho thay đổi số lượng "part"
  const canEditStructure = false;

  const defaultSingleQuestion = {
    parentQuestion: "",
    imgUrl: "",
    paragraph: "",
    type: "",
    point: 0,
    instruction: "",
    audioUrl: "",
    childQuestions: [
      {
        id: "",
        content: "",
        imgUrl: "",
        options: [],
        correctAnswer: "",
      },
    ],
  };

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      questions: [defaultSingleQuestion],
    },
    resolver: editHSKResolver, // dùng resolver custom
    mode: "onChange",
  });

  const { fields: questionFields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  // watch toàn bộ questions để header / ảnh cập nhật realtime
  const watchedQuestions = useWatch({
    control,
    name: "questions",
  });

  useEffect(() => {
    if (examData?.questions) {
      const normalized = normalizeQuestionsFromBE(examData.questions);
      reset({
        questions: normalized,
      });
    } else {
      reset({
        questions: [defaultSingleQuestion],
      });
    }
  }, [examData, reset]);

  const handleAudioChange = async (e, qIndex) => {
    if (isStartTimeOver) return;
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadImage(file, (p) => setProgress(p));
      setValue(`questions.${qIndex}.audioUrl`, url, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setAudioUrl((prev) => ({ ...prev, [qIndex]: url }));
    }
  };

  const handleThumbnailChange = async (e, qIndex) => {
    if (isStartTimeOver) return;
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadImage(file, () => {});
      setValue(`questions.${qIndex}.imgUrl`, url, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setImgUrls((prev) => ({ ...prev, [qIndex]: url }));
    }
  };

  // upload ảnh cho từng câu con
  const handleChildThumbnailChange = async (e, qIndex, cIndex) => {
    if (isStartTimeOver) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file, () => {});
    const path = `questions.${qIndex}.childQuestions.${cIndex}.imgUrl`;

    setValue(path, url, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setChildImgUrls((prev) => ({
      ...prev,
      [`${qIndex}-${cIndex}`]: url,
    }));
  };

  const onSubmit = async (data) => {
    if (isStartTimeOver) {
      alert("Không thể chỉnh sửa vì thời gian bắt đầu đã qua.");
      return;
    }
    const res = await saveQuestions(examId, data.questions);
    if (res.status === 200) {
      alert("Lưu câu hỏi thành công");
      navigate(-1);
    }
  };

  return (
    <div className="w-full my-6">
      {/* ===== Header ===== */}
      <div className="mb-4 flex items-center gap-4">
        <button
          className="p-2 text-primary rounded-full shadow-sm hover:bg-gray-100"
          onClick={() => navigate(`/manage-document/exam/edit/${examId}`)}
          title="Quay lại"
          type="button"
        >
          <ArrowBack />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Chỉnh sửa câu hỏi 
          </h1>
          {isStartTimeOver && (
            <p className="mt-1 text-sm text-red-600">
              Đã quá giờ bắt đầu, không thể chỉnh sửa.
            </p>
          )}
        </div>
      </div>

      <hr className="my-4" />

      {/* ===== FORM EDIT – hiện TẤT CẢ câu hỏi để sửa ===== */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {questionFields.map((question, qIndex) => {
          const watchedParent = watchedQuestions?.[qIndex] || question;
          const parentTitle = watchedParent?.parentQuestion || "";

          const globalNo = getGlobalQuestionNo(parentTitle);

          const isListening =
            globalNo !== null && globalNo >= 1 && globalNo <= 35;
          const isListeningLetterBank =
            globalNo !== null && globalNo >= 11 && globalNo <= 20; // Nghe 11–20: A–F

          const isReading1 =
            globalNo !== null && globalNo >= 36 && globalNo <= 40;
          const isReading2 =
            globalNo !== null && globalNo >= 41 && globalNo <= 45;
          const isReading3 =
            globalNo !== null && globalNo >= 46 && globalNo <= 50;
          const isReading4 =
            globalNo !== null && globalNo >= 51 && globalNo <= 60;
          const isReading5 =
            globalNo !== null && globalNo >= 61 && globalNo <= 70;
          const isWriting =
            globalNo !== null && globalNo >= 71 && globalNo <= 80;

          // các part dùng bank chữ (không render OptionsForm)
          const isLetterOnlyBankSection =
            isListeningLetterBank || isReading1 || isReading2 || isReading4;

          return (
            <div
              key={question.id}
              className="border border-gray-300 border-solid rounded-lg bg-white p-4 shadow"
              id={`q${qIndex}`}
            >
              {/* ===== Part header ===== */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {question.parentQuestion
                      ? `HSK 2 - ${question.parentQuestion}`
                      : `HSK 2 - Phần ${qIndex + 1}`}
                  </h2>
                  {globalNo !== null && (
                    <p className="mt-1 text-xs text-gray-500">
                      {isListening && "听力 (1–35)"}
                      {isReading1 && "阅读 第一部分 (36–40)"}
                      {isReading2 && "阅读 第二部分 (41–45)"}
                      {isReading3 && "阅读 第三部分 (46–50) – Đúng / Sai"}
                      {isReading4 && "阅读 第四部分 (51–60)"}
                      {isReading5 && "阅读 第五部分 (61–70)"}
                      {isWriting && "写作 (71–80)"}
                    </p>
                  )}
                </div>

                {canEditStructure && (
                  <button
                    type="button"
                    onClick={() => remove(qIndex)}
                    className={`second-btn flex items-center gap-2 ${
                      isStartTimeOver ? "cursor-not-allowed opacity-60" : ""
                    }`}
                    disabled={isStartTimeOver}
                  >
                    <Delete /> Xóa Phần {qIndex + 1}
                  </button>
                )}
              </div>

              {/* Parent title */}
              <div className="mb-4">
                <input
                  {...register(`questions.${qIndex}.parentQuestion`)}
                  placeholder="VD: HSK2 - 听力 第二部分 (11–15)"
                  className="w-full rounded border border-gray-300 p-3"
                  disabled={isStartTimeOver}
                />
                {errors.questions?.[qIndex]?.parentQuestion && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.questions[qIndex].parentQuestion.message}
                  </p>
                )}
              </div>

              {/* ===== Child questions ===== */}
              <div className="border-t border-dashed border-gray-300 pt-4">
                {(question.childQuestions || []).map((child, cIndex) => {
                  const contentError =
                    errors.questions?.[qIndex]?.childQuestions?.[cIndex]
                      ?.content;
                  const answerError =
                    errors.questions?.[qIndex]?.childQuestions?.[cIndex]
                      ?.correctAnswer;

                  const childKey = `${qIndex}-${cIndex}`;

                  const watchedChild =
                    watchedParent?.childQuestions?.[cIndex] || child;

                  // ảnh parent
                  const parentImg =
                    watchedParent?.imgUrl || imgUrls[qIndex] || "";

                  // ảnh child (ưu tiên) hoặc fallback parent
                  const currentChildImg =
                    watchedChild?.imgUrl || childImgUrls[childKey] || parentImg;

                  const correctPath = `questions.${qIndex}.childQuestions.${cIndex}.correctAnswer`;
                  const rawCorrect = (watchedChild?.correctAnswer || "").trim();

                  // chuẩn hoá Đúng/Sai cho UI
                  const normalizedTF = ["✓", "对", "a", "A", "1"].includes(
                    rawCorrect
                  )
                    ? "true"
                    : ["×", "错", "b", "B", "x", "X", "0"].includes(rawCorrect)
                    ? "false"
                    : "";

                  const handleTFChange = (val) => {
                    if (isStartTimeOver) return;
                    setValue(correctPath, val, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  };

                  return (
                    <div
                      key={`${question.id}-child-${cIndex}`}
                      className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      {/* Chỉ phần nghe mới cho upload hình từng câu */}
                      {isListening && (
                        <div className="mb-3 rounded border border-dashed border-gray-300 bg-white p-3">
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Hình ảnh (nếu có)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleChildThumbnailChange(e, qIndex, cIndex)
                            }
                            className="block w-full text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                            disabled={isStartTimeOver}
                          />
                          {currentChildImg && (
                            <div className="mt-2 flex justify-center">
                              <img
                                src={currentChildImg}
                                alt={`Câu ${cIndex + 1}`}
                                className="max-h-48 rounded object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* ====== CONTENT + ĐÁP ÁN tuỳ từng phần ====== */}

                      {/* 71–80: viết – content + đáp án là đoạn văn */}
                      {isWriting ? (
                        <>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Đề bài (câu 71–80)
                          </label>
                          <textarea
                            rows={3}
                            {...register(
                              `questions.${qIndex}.childQuestions.${cIndex}.content`
                            )}
                            placeholder={`Nhập đề bài cho câu ${
                              globalNo || ""
                            }`}
                            className={`w-full rounded border px-3 py-2 text-sm ${
                              contentError
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            disabled={isStartTimeOver}
                          />
                          {contentError && (
                            <p className="mt-1 text-xs text-red-500">
                              {contentError.message}
                            </p>
                          )}

                          <label className="mt-3 mb-1 block text-sm font-medium text-gray-700">
                            Đáp án (đoạn viết mẫu, nếu có)
                          </label>
                          <textarea
                            rows={3}
                            {...register(correctPath)}
                            placeholder="Nhập đoạn viết mẫu hoặc để trống nếu không cần"
                            className={`w-full rounded border px-3 py-2 text-sm ${
                              answerError
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            disabled={isStartTimeOver}
                          />
                          {answerError && (
                            <p className="mt-1 text-xs text-red-500">
                              {answerError.message}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Content cho nghe / đọc */}
                          <input
                            type="text"
                            {...register(
                              `questions.${qIndex}.childQuestions.${cIndex}.content`
                            )}
                            placeholder={
                              isListening
                                ? `[EMPTY CONTENT ${
                                    cIndex + 1
                                  }] (phần nghe có thể để trống)`
                                : `[EMPTY CONTENT ${cIndex + 1}]`
                            }
                            className={`w-full rounded border px-3 py-2 ${
                              contentError
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            disabled={isStartTimeOver}
                          />
                          {contentError && (
                            <p className="mt-1 text-sm text-red-500">
                              {contentError.message}
                            </p>
                          )}

                          {/* 46–50: Đúng / Sai => radio ✓ / × */}
                          {isReading3 ? (
                            <div className="mt-3">
                              <p className="mb-1 text-sm font-medium text-gray-700">
                                Đáp án (✓ / ×)
                              </p>
                              <div className="flex items-center gap-6 text-sm">
                                <label className="inline-flex items-center gap-1">
                                  <input
                                    type="radio"
                                    className="h-4 w-4"
                                    checked={normalizedTF === "true"}
                                    onChange={() => handleTFChange("✓")}
                                    disabled={isStartTimeOver}
                                  />
                                  <span>✓ (Đúng)</span>
                                </label>
                                <label className="inline-flex items-center gap-1">
                                  <input
                                    type="radio"
                                    className="h-4 w-4"
                                    checked={normalizedTF === "false"}
                                    onChange={() => handleTFChange("×")}
                                    disabled={isStartTimeOver}
                                  />
                                  <span>× (Sai)</span>
                                </label>
                              </div>
                              {answerError && (
                                <p className="mt-1 text-xs text-red-500">
                                  {answerError.message}
                                </p>
                              )}
                            </div>
                          ) : isLetterOnlyBankSection ? (
                            // Nghe 11–20 + Đọc 36–40, 41–45, 51–60: chỉ cần nhập A–F
                            <div className="mt-3">
                              <p className="mb-1 text-sm font-medium text-gray-700">
                                Đáp án (A–F)
                              </p>
                              <input
                                type="text"
                                maxLength={1}
                                {...register(correctPath, {
                                  setValueAs: (v) =>
                                    v ? String(v).trim().toLowerCase() : "",
                                })}
                                className={`w-20 rounded border px-3 py-2 text-center uppercase ${
                                  answerError
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                disabled={isStartTimeOver}
                              />
                              {answerError && (
                                <p className="mt-1 text-xs text-red-500">
                                  {answerError.message}
                                </p>
                              )}
                            </div>
                          ) : (
                            // Các phần còn lại dùng multiple choice (OptionsForm)
                            <OptionsForm
                              control={control}
                              register={register}
                              errors={errors}
                              qIndex={qIndex}
                              cIndex={cIndex}
                              isStartTimeOver={isStartTimeOver}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add part – TẮT khi chỉ cho sửa nội dung */}
        {canEditStructure && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => append(defaultSingleQuestion)}
              className={`flex items-center gap-2 rounded-md px-4 py-3 duration-150 ${
                isStartTimeOver
                  ? "cursor-not-allowed bg-gray-400 text-gray-700"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
              disabled={isStartTimeOver}
            >
              <Add fontSize="small" /> Thêm phần câu hỏi mới
            </button>
          </div>
        )}

        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <p className="text-center font-semibold text-red-600">
            Vui lòng sửa các lỗi validation trước khi lưu.
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`primary-btn ${
              isStartTimeOver
                ? "cursor-not-allowed bg-gray-400 text-gray-700"
                : ""
            }`}
            disabled={isStartTimeOver || isSubmitting}
          >
            Lưu bài thi
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditListQuestion;