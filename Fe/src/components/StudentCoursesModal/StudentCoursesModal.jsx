import { useStudentCourses } from "@/hooks/useAdminDashboard";
import React from "react";
import { Close, School, Class } from "@mui/icons-material";
import { getCourseImageSrc } from "@/utils/courseMedia";

const StudentCoursesModal = ({ student, onClose }) => {
  const { data, isLoading, error } = useStudentCourses(student?.id);
  const courses = data || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative 
                      max-h-[80vh] flex flex-col overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-xl"
        >
          <Close />
        </button>

        {/* Header (fixed height) */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold text-teal-700">
            <span className="inline-flex items-center gap-2">
              <School fontSize="small" /> Khoá học của {student?.name}
            </span>
          </h2>
        </div>

        {/* Body scrollable */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : error ? (
            <p className="text-red-500">Không thể tải dữ liệu.</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-600">Học viên chưa ghi danh khoá học nào.</p>
          ) : (
            courses.map((course) => (
              <div
                key={course._id}
                className="bg-[#F0FAFF] border rounded-lg p-4 flex items-center hover:bg-[#E6F7F7] transition"
              >
                <img
                  src={getCourseImageSrc(course, "/default-course.jpg")}
                  alt={course.title || "Khóa học"}
                  className="w-16 h-16 rounded-md object-cover mr-4 shadow"
                />

                <div className="flex-1">
                  <p className="font-semibold text-lg">{course.title}</p>

                  <p className="text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Class fontSize="inherit" /> HSK Level: {course.targetLevel}
                    </span>
                  </p>

                  <p className="text-sm text-gray-600">
                    Giáo viên: {course.assignedTeacher?.name || "Không có"}
                  </p>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesModal;