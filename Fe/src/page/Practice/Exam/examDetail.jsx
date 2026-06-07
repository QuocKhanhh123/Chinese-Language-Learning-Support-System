// src/pages/practice/ExamDetailPage.jsx
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useExamById, useExamHistory, useStartExam } from '../../../hooks/useExam'

const ExamDetailPage = () => {
  const { exam_id } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const { data: exam, isLoading: isExamLoading } = useExamById(exam_id)
  const { data: historyData, isLoading: isHistoryLoading } = useExamHistory(exam_id)

  // lịch sử thật sự là historyData.attempts
  const attempts = historyData?.attempts || []

  // Phân loại attempt theo status
  const inProgressAttempt = attempts.find((a) => a.status === 'in_progress')
  const submittedAttempt = attempts.find((a) => a.status === 'submitted')
  const gradedAttempt = attempts.find((a) => a.status === 'graded')

  const { mutateAsync: startExam, isLoading: isStarting } = useStartExam()

  const handleStartExam = async () => {
    setError(null)

    if (!exam?._id) {
      setError('Không tìm thấy ID bài thi')
      return
    }

    if (!exam.questionCount || exam.questionCount === 0) {
      setError(
        'Bài thi này hiện không có câu hỏi nào. Vui lòng liên hệ giáo viên.'
      )
      return
    }

    // 1) Nếu đang làm dở → cho tiếp tục
    if (inProgressAttempt) {
      navigate(`/practice/exam/doing/${exam_id}`, {
        state: { attemptId: inProgressAttempt._id },
      })
      return
    }

    // 2) Nếu đã nộp (submitted) nhưng chưa chấm → KHÔNG cho làm lại
    if (submittedAttempt) {
      setError(
        'Bạn đã nộp bài và đang chờ giáo viên chấm điểm. Không thể tiếp tục làm hoặc thi lại lúc này.'
      )
      return
    }

    // 3) Nếu đã graded → không cho thi lại
    if (gradedAttempt) {
      setError('Bạn đã hoàn thành bài thi này và không thể làm lại.')
      return
    }

    // 4) Chưa có attempt nào → bắt đầu lần đầu
    try {
      const res = await startExam(exam._id)
      // backend: { resultId, attemptCount, exam?, timeLimitMinutes, startedAt }
      if (!res?.resultId) {
        throw new Error('Không nhận được attemptId từ server')
      }

      navigate(`/practice/exam/doing/${exam_id}`, {
        state: { attemptId: res.resultId },
      })
    } catch (err) {
      console.error('Lỗi khi startExam:', err)
      setError(
        err?.response?.data?.message || err.message || 'Không thể bắt đầu bài thi'
      )
    }
  }

  if (isExamLoading || isHistoryLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-lg text-gray-600">Đang tải chi tiết bài thi...</p>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-red-600 font-semibold">
          Không tìm thấy thông tin bài thi
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {exam?.title}
        </h1>
        <p className="text-gray-600 text-base mb-3">{exam?.description}</p>

        <p className="text-sm text-gray-500">
          Thời gian: {exam.timeLimitMinutes} phút • Tổng câu:{' '}
          {exam.totalPoints} 
        </p>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}

        {/* Nút hành động chính */}
        {gradedAttempt ? (
          <>
            <p className="mt-4 text-sm text-red-600">
              Bạn đã hoàn thành bài thi này và không thể làm lại.
            </p>
            <button
              disabled
              className="mt-4 inline-block bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-50"
            >
              Bắt đầu làm bài
            </button>
          </>
        ) : submittedAttempt ? (
          <>
            <p className="mt-4 text-sm text-orange-600">
              Bạn đã nộp bài. Không thể làm lại.
            </p>
            <button
              disabled
              className="mt-4 inline-block bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed opacity-50"
            >
              Đã nộp bài
            </button>
          </>
        ) : (
          <button
            onClick={handleStartExam}
            className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300"
          >
            {isStarting
              ? 'Đang bắt đầu...'
              : inProgressAttempt
              ? 'Tiếp tục làm bài'
              : 'Bắt đầu làm bài'}
          </button>
        )}
      </div>

      {/* Lịch sử làm bài */}
      {attempts.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Lịch sử làm bài
          </h2>
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt._id}
                className="border border-gray-200 p-4 rounded-lg shadow-sm flex justify-between items-center bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-700">
                    {attempt.status === 'graded' ? (
                      <>
                        Điểm:{' '}
                        <span className="text-red-600">
                          {attempt.score?.percentage ?? 0}%
                        </span>
                      </>
                    ) : attempt.status === 'submitted' ? (
                      <span className="text-teal-600">
                        Đã nộp bài, chờ chấm điểm
                      </span>
                    ) : (
                      <span className="text-orange-600">
                        Chưa hoàn thành (trạng thái: {attempt.status})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {attempt.status === 'graded'
                      ? `Ngày nộp: ${
                          attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleString()
                            : '—'
                        }`
                      : `Bắt đầu lúc: ${
                          attempt.startedAt
                            ? new Date(attempt.startedAt).toLocaleString()
                            : '—'
                        }`}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (attempt.status === 'in_progress') {
                      // chỉ in_progress mới được tiếp tục làm
                      navigate(`/practice/exam/doing/${exam_id}`, {
                        state: { attemptId: attempt._id },
                      })
                    } else {
                      // submitted / graded → xem kết quả / bài đã nộp
                      navigate(`/practice/exam/result/${attempt._id}`)
                    }
                  }}
                  className={`text-white px-4 py-2 rounded transition duration-300 ${
                    attempt.status === 'graded'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : attempt.status === 'submitted'
                      ? 'bg-teal-600 hover:bg-teal-700'
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {attempt.status === 'graded'
                    ? 'Xem kết quả'
                    : attempt.status === 'submitted'
                    ? 'Xem bài đã nộp'
                    : 'Tiếp tục làm'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamDetailPage