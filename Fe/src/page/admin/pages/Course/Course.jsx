import { Link, useNavigate } from "react-router-dom";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useCourses, useDeleteCourse } from "../../../../hooks/useCourses";
import { useUsers } from "../../../../hooks/useUsers";
import CourseCard from "../../../../components/card/CourseCard";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// Debounce simple version
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useMemo(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

const Course = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading, error } = useCourses();
  const { data: users, isLoading: isUsersLoading } = useUsers();
  const deleteCourseMut = useDeleteCourse();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Map teacher id → teacher name
  const teacherMap = useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, user) => {
      acc[user._id] = user.name;
      return acc;
    }, {});
  }, [users]);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!debouncedSearch.trim()) return courses;

    return courses.filter((c) =>
      c.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [courses, debouncedSearch]);

  if (isLoading || isUsersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-600 font-medium">
          Lỗi khi tải khóa học: {error.message}
        </p>
      </div>
    );
  }

  const totalCourses = filteredCourses.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">

          {/* Title + count */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý khóa học
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tổng: {totalCourses} khóa học
            </p>
          </div>

          {/* Search box */}
          <div className="flex-1 md:max-w-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                         focus:ring-2 focus:ring-red-500 focus:border-red-500 
                         outline-none transition bg-white"
            />
          </div>

          {/* Create Button */}
          <Link
            to="/admin/new-course"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 
                       text-white font-medium rounded-lg px-4 py-2.5 transition"
          >
            <Add fontSize="small" />
            Tạo khóa học mới
          </Link>
        </div>

        {/* Course grid */}
        {totalCourses === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Không tìm thấy khóa học nào cho từ khóa "{debouncedSearch}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredCourses.map((course) => (
              <div key={course._id} className="relative group">
                <Link
                  to={`/admin/courses/${course._id}`}
                  state={{ course }}
                  className="block h-full"
                >
                  <CourseCard
                    course={course}
                    teacherName={teacherMap[course.assignedTeacher]}
                    showTeacher={false}
                  />
                </Link>

                {/* Actions overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <button
                    type="button"
                    className="p-2 rounded-lg bg-white/95 border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700"
                    title="Sửa khóa học"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/admin/edit/${course._id}`);
                    }}
                  >
                    <Edit fontSize="small" />
                  </button>

                  <button
                    type="button"
                    className="p-2 rounded-lg bg-white/95 border border-red-200 shadow-sm hover:bg-red-50 text-red-600"
                    title="Xóa khóa học"
                    disabled={deleteCourseMut.isPending}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const r = await Swal.fire({
                        icon: "warning",
                        title: "Xóa khóa học?",
                        text: "Hành động này không thể hoàn tác.",
                        showCancelButton: true,
                        confirmButtonText: "Xóa",
                        cancelButtonText: "Hủy",
                        confirmButtonColor: "#dc2626",
                      });
                      if (!r.isConfirmed) return;

                      try {
                        await deleteCourseMut.mutateAsync(course._id);
                        toast.success("Đã xóa khóa học");
                      } catch (err) {
                        toast.error(
                          err?.response?.data?.message || "Xóa thất bại, vui lòng thử lại"
                        );
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Course;
