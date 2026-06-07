import React from "react";
import { useTeacherClasses } from "@/hooks/useTeacher";
import { Close, School } from "@mui/icons-material";
import { getCourseImageSrc } from "@/utils/courseMedia";

const CLASS_STATUS_LABELS = {
  open: "Mở đăng ký",
  closed: "Đóng đăng ký",
  ongoing: "Đang diễn ra",
  finished: "Kết thúc",
};

const TeacherCoursesModal = ({ teacherId, onClose }) => {
  const { data: classes = [], isLoading, error } = useTeacherClasses(teacherId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative
                   max-h-[90vh] flex flex-col overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
        >
          <Close />
        </button>

        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-700">
            <span className="inline-flex items-center gap-2">
              <School fontSize="small" /> Lớp học giáo viên đang dạy
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách các lớp học được phân công giảng dạy.
          </p>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading ? (
            <p>Đang tải...</p>
          ) : error ? (
            <p className="text-red-500">Không thể tải dữ liệu.</p>
          ) : classes.length === 0 ? (
            <p className="text-gray-600">
              Giáo viên chưa được phân công lớp học nào.
            </p>
          ) : (
            classes.map((cls) => {
              const course = cls.course || {};
              const courseImage = getCourseImageSrc(course);

              return (
                <div
                  key={cls._id}
                  className="border rounded-xl p-4 bg-[#F8FCFF] hover:bg-[#EEF8FF] transition"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={courseImage}
                      alt={course.title || "Khóa học"}
                      className="w-16 h-16 rounded-xl object-cover border bg-white"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-lg text-slate-900 truncate">
                        {cls.name}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Khóa: <b>{course.title || "Chưa có thông tin"}</b>
                        {course.targetLevel ? ` • ${course.targetLevel}` : ""}
                        {typeof course.price === "number"
                          ? ` • Học phí: ${course.price.toLocaleString(
                              "vi-VN"
                            )}đ`
                          : ""}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Trạng thái:{" "}
                        <b className="text-slate-700">
                          {CLASS_STATUS_LABELS[cls.status] || cls.status}
                        </b>
                        {typeof cls.enrolledCount === "number"
                          ? ` • Học viên: ${cls.enrolledCount}/${cls.maxStudents}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCoursesModal;
