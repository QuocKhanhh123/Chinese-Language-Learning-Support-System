import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import TeacherRow from "@/components/card/TeacherRow";
import TeacherCoursesModal from "@/components/TeacherCoursesModal/TeacherCoursesModal";
import TeacherDetailModal from "@/components/TeacherDetailModal/TeacherDetailModal";
import { useUsersByRole, useDeleteUser, useUpdateStatus } from "@/hooks/useAdmin";

const transformTeacherData = (t) => ({
  id: t._id,
  _id: t._id,
  name: t.name,
  email: t.email,
  avatar: t.avatar || "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
  phone: t.phone,
  status: t.status || "pending",
  experienceYears: t.teacher_profile?.experience_years ?? 0,
  subjects: t.teacher_profile?.subjects ?? [],
  certificates: t.teacher_profile?.certificates ?? [],
  bio: t.teacher_profile?.bio ?? "",
});

export default function Teacher() {
  // ✅ dùng chung /users/get-users?role=teacher
  const { data: rawTeachers = [], isLoading, error } = useUsersByRole("teacher");
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Teacher component renders a list of teachers and their details.
 * It uses the useTeachers hook to fetch the teachers data and maps it to an array of TeacherCard components.
 * The component also renders two modals: TeacherDetailModal and TeacherCoursesModal, which display the teacher's details and courses respectively.
 * The user can view the teacher's details and courses by clicking on the corresponding buttons.
 * The component also renders a loading UI when the data is being fetched and an error UI when there is an error.
 */
/*******  2ca31547-9441-4201-9895-9d2bc383acce  *******/  const teachers = useMemo(() => rawTeachers.map(transformTeacherData), [rawTeachers]);

  // mutations
  const delMut = useDeleteUser();
  const statusMut = useUpdateStatus();

  // modals
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCoursesModal, setShowCoursesModal] = useState(false);

  const closeModals = () => {
    setSelectedTeacher(null);
    setShowDetailModal(false);
    setShowCoursesModal(false);
  };

  // filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return teachers.filter((t) => {
      const matchText =
        !term ||
        (t.name || "").toLowerCase().includes(term) ||
        (t.email || "").toLowerCase().includes(term) ||
        (t.phone || "").toLowerCase().includes(term) ||
        (t.subjects || []).join(" ").toLowerCase().includes(term);

      const matchStatus =
        statusFilter === "all" ? true : (t.status || "pending") === statusFilter;

      return matchText && matchStatus;
    });
  }, [teachers, q, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 font-medium">
          Lỗi tải dữ liệu giáo viên.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý giáo viên
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tổng: {teachers.length} giáo viên
            </p>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition font-medium"
            onClick={() => {
              // TODO: gắn modal thêm giáo viên nếu có
            }}
          >
            <AddIcon fontSize="small" /> Thêm giáo viên
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
              <SearchIcon fontSize="small" className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên / email / SĐT / chuyên môn..."
                className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Xoá
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="pending">Chờ kích hoạt</option>
                <option value="blocked">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-500 text-center">
            Không có giáo viên phù hợp.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => (
              <TeacherRow
                key={t.id}
                teacher={t}
                isDeleting={delMut.isPending}
                isUpdatingStatus={statusMut.isPending}
                onViewDetail={() => {
                  setSelectedTeacher(t);
                  setShowDetailModal(true);
                }}
                onViewCourses={() => {
                  setSelectedTeacher(t);
                  setShowCoursesModal(true);
                }}
                onUpdateStatus={(newStatus) =>
                  statusMut.mutateAsync({ id: t.id, status: newStatus })
                }
                onDelete={(id) => delMut.mutateAsync(id)}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {showDetailModal && selectedTeacher && (
          <TeacherDetailModal teacherId={selectedTeacher.id} onClose={closeModals} />
        )}

        {showCoursesModal && selectedTeacher && (
          <TeacherCoursesModal teacherId={selectedTeacher.id} onClose={closeModals} />
        )}
      </div>
    </div>
  );
}
