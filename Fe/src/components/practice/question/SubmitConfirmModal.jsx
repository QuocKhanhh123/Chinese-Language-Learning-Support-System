import React from 'react'

const SubmitConfirmModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-2 text-lg font-semibold text-primary">
          Xác nhận nộp bài
        </h2>
        <p className="mb-6 text-sm text-gray-700 ">
          Bạn có chắc chắn muốn nộp bài không? Sau khi nộp, bạn sẽ không thể
          thay đổi câu trả lời.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="primary-btn rounded-full px-4 py-2 text-sm font-semibold bg-red-400"
          >
            Xác nhận nộp bài
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubmitConfirmModal