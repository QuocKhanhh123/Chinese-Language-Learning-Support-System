// src/components/edit-exam/QuestionInputForm.jsx
import { zodResolver } from '@hookform/resolvers/zod'
import { Add, Delete } from '@mui/icons-material'
import { useFieldArray, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import {
  createQuestionExam,
  createQuestionRevision,
  updateQuestionExam,
  updateQuestionRevision,
} from './api/questionService'

// ===== Zod schema cho 1 câu hỏi con (child) =====
const questionSchema = z.object({
  content: z.string().min(1, 'Câu hỏi không được để trống'),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().min(1, 'Đáp án không được để trống'),
      })
    )
    .min(2, 'Phải có ít nhất 2 đáp án'),
  correctAnswer: z.string().min(1, 'Phải chọn một đáp án đúng'),
})

// helper: tạo id đáp án a,b,c...
const generateOptionId = (index) => String.fromCharCode(97 + index)

function QuestionInputForm({
  question = null, // có thể là dạng HSK (parentQuestion + childQuestions) hoặc câu thường
  onSaveCallback,
  isRevisionMode,
}) {
  const { examId, lessonId, renshuuId } = useParams()

  // ---- phân biệt câu HSK (parent có childQuestions) hay câu thường ----
  const isHSKParent = !!question?.childQuestions

  // Với HSK: edit childQuestions[0] là chính (câu 1 của part đó)
  const firstChild = isHSKParent
    ? question.childQuestions?.[0] || {}
    : question || {}

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      // lấy từ childQuestions[0] nếu là HSK, còn không thì lấy trực tiếp từ question
      content: firstChild.content || '',
      options:
        (Array.isArray(firstChild.options) && firstChild.options.length > 0
          ? firstChild.options
          : question?.options) ||
        [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
        ],
      correctAnswer: (firstChild.correctAnswer ||
        question?.correctAnswer ||
        ''
      ).toString(),
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  })

  const correctAnswer = watch('correctAnswer')

  const onSubmit = async (data) => {
    data.type = 'multiple_choice'
    let res = null

    // ================== CASE 1: CHỈNH SỬA ĐỀ HSK (EXAM) ==================
    if (!isRevisionMode && isHSKParent && question) {
      const parentId = question._id || question.id

      // child cũ (nếu có) để giữ lại các field khác (type, v.v.)
      const oldChild = question.childQuestions?.[0] || {}

      // map options: đảm bảo có id a/b/c...
      const mappedOptions = (data.options || []).map((opt, index) => ({
        id: opt.id || generateOptionId(index),
        text: opt.text,
      }))

      const updatedChild = {
        ...oldChild,
        content: data.content,
        options: mappedOptions,
        correctAnswer: data.correctAnswer,
        type: oldChild.type || 'multiple_choice',
      }

      const updatedParent = {
        ...question,
        childQuestions: [
          updatedChild,
          ...(question.childQuestions?.slice(1) || []),
        ],
      }

      res = await updateQuestionExam(examId, parentId, updatedParent)
    }

    // ================== CASE 2: EXAM CÂU THƯỜNG (KHÔNG HSK) ==================
    if (!isRevisionMode && !isHSKParent) {
      const mappedOptions = (data.options || []).map((opt, index) => ({
        id: opt.id || generateOptionId(index),
        text: opt.text,
      }))

      const payload = {
        ...data,
        options: mappedOptions,
      }

      if (question) {
        // update câu có sẵn
        res = await updateQuestionExam(examId, question?.id || question?._id, payload)
      } else {
        // tạo mới 1 câu (nếu còn dùng flow này)
        res = await createQuestionExam(examId, payload)
      }
    }

    // ================== CASE 3: Renshuu revision (giữ nguyên logic cũ) =======
    if (isRevisionMode) {
      const mappedOptions = (data.options || []).map((opt, index) => ({
        id: opt.id || generateOptionId(index),
        text: opt.text,
      }))

      const payloadQuestion = {
        ...data,
        options: mappedOptions,
      }

      if (question) {
        payloadQuestion._id = question?._id
        const payload = {
          lessonId,
          renshuuId,
          question: payloadQuestion,
        }
        res = await updateQuestionRevision(payload)
      } else {
        const payload = { lessonId, question: payloadQuestion }
        res = await createQuestionRevision(payload)
      }
    }

    if (res?.status === 200) {
      alert('Question saved successfully')
      reset()
      onSaveCallback?.()
    }
  }

  const handleRemoveOption = (index) => {
    const id = generateOptionId(index)
    if (correctAnswer === id) setValue('correctAnswer', '')
    remove(index)
  }

  const handleAddOption = () => {
    const newId = generateOptionId(fields.length)
    append({ id: newId, text: '' })
    setValue(`options.${fields.length}.id`, newId)
  }

  return (
    <form className="my-6" onSubmit={handleSubmit(onSubmit)}>
      {/* ===== Card style giống HSK preview nhưng cho phép chỉnh sửa ===== */}
      <div className="border border-gray-300 rounded-lg shadow bg-white p-4 md:p-5 max-w-3xl mx-auto">
        {/* Header: thông tin part HSK + ảnh/audio nếu có */}
        {isHSKParent && (
          <div className="mb-4 border-b border-dashed border-gray-200 pb-3">
            {question.parentQuestion && (
              <p className="text-sm font-semibold text-primary mb-1">
                {question.parentQuestion}
              </p>
            )}

            {/* Hình ảnh HSK */}
            {question.imgUrl && (
              <div className="mt-2 flex justify-center">
                <img
                  src={question.imgUrl}
                  alt="HSK question"
                  className="max-h-64 rounded object-contain"
                />
              </div>
            )}

            {/* Audio nếu có */}
            {question.audioUrl && (
              <div className="mt-3">
                <audio controls src={question.audioUrl} className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* Câu hỏi con (giống layout 1 item HSKPreview, nhưng có input) */}
        <div className="mb-4">
          <label className="font-semibold block mb-2">
            {isHSKParent ? 'Nội dung câu hỏi (Câu 1 trong part này):' : 'Câu hỏi:'}
          </label>
          <input
            type="text"
            className={`w-full border rounded px-3 py-2 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('content')}
            placeholder={
              isHSKParent
                ? 'Mô tả bức tranh / đoạn nghe của Câu 1'
                : 'Nhập nội dung câu hỏi'
            }
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Đáp án – layout giống HSKPreview: Badge A/B/C, text, radio chọn đúng */}
        <div className="mb-2">
          <label className="font-semibold block mb-3">
            Đáp án (click radio để chọn đáp án đúng):
          </label>

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => {
              const letterId = generateOptionId(index)
              const isCorrect = correctAnswer === letterId

              return (
                <div
                  key={field.id}
                  className={`rounded-lg border px-3 py-2 flex items-center gap-3 ${
                    isCorrect ? 'border-black bg-green-50' : 'border-gray-200'
                  }`}
                >
                  {/* Badge chữ A/B/C giống HSKPreview */}
                  <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-black font-bold text-lg">
                    {letterId.toUpperCase()}
                  </span>

                  {/* Text đáp án */}
                  <input
                    type="text"
                    className={`flex-1 border rounded px-2 py-1 ${
                      errors.options?.[index]?.text
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    {...register(`options.${index}.text`)}
                    placeholder={`Nhập đáp án ${index + 1}`}
                  />

                  {/* Radio – chọn đáp án đúng */}
                  <input
                    type="radio"
                    name="correctAnswer"
                    className="w-4 h-4 cursor-pointer"
                    value={letterId}
                    checked={isCorrect}
                    onChange={() => setValue('correctAnswer', letterId)}
                  />

                  {/* Xoá đáp án */}
                  <button
                    type="button"
                    className="rounded-full hover:bg-gray-200 p-2 duration-150 text-red-500"
                    title="Xóa đáp án"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Delete fontSize="small" />
                  </button>

                  {errors.options?.[index]?.text && (
                    <p className="text-red-500 text-sm">
                      {errors.options[index].text.message}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={fields.length >= 6}
              onClick={handleAddOption}
              className="second-btn flex items-center gap-2"
              title="Thêm đáp án"
            >
              <Add fontSize="small" />
              Thêm đáp án
            </button>
            {errors.options && fields.length < 2 && (
              <p className="text-red-500 text-sm">
                Phải có ít nhất 2 đáp án.
              </p>
            )}
          </div>

          {errors.correctAnswer && (
            <p className="text-red-500 text-sm mt-2">
              {errors.correctAnswer.message}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="primary-btn"
          >
            Lưu câu hỏi
          </button>
        </div>
      </div>
    </form>
  )
}

export default QuestionInputForm