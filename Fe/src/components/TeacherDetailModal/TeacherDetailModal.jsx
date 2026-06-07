import { useTeacherById } from "@/hooks/useTeacher";
import React from "react";

const TeacherDetailModal = ({ teacherId, onClose }) => {
  const { data: teacher, isLoading, error } = useTeacherById(teacherId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl relative 
                      max-h-[85vh] flex flex-col overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-xl"
        >
          ✖
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-teal-700">
            👨‍🏫 Thông tin giáo viên
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading ? (
            <p>Đang tải...</p>
          ) : error ? (
            <p className="text-red-500">Không thể tải dữ liệu.</p>
          ) : !teacher ? (
            <p>Không tìm thấy giáo viên.</p>
          ) : (
            <>
              {/* Avatar + Basic Info */}
              <div className="flex items-center gap-4">
                <img
                  src={
                    teacher.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
                  }
                  alt={teacher.name}
                  className="w-20 h-20 rounded-full shadow object-cover"
                />

                <div>
                  <h3 className="text-xl font-semibold">{teacher.name}</h3>
                  <p className="text-gray-600">{teacher.email}</p>

                  {teacher.phone && (
                    <p className="text-gray-600">📞 {teacher.phone}</p>
                  )}
                </div>
              </div>

              <hr className="border-gray-200" />


              {/* Status */}
              <div>
                <h4 className="text-lg font-semibold text-teal-700 mb-2">
                  🟢 Trạng thái tài khoản
                </h4>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium
                    ${
                      teacher.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {teacher.status === "active"
                    ? "Đang hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailModal;