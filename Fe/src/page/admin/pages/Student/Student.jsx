import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import StudentCoursesModal from "@/components/StudentCoursesModal/StudentCoursesModal";
import StudentDetailModal from "@/components/StudentDetailModal/StudentDetailModal";
import {
  useUsersByRole,
  useDeleteUser,
  useUpdateStatus,
} from "@/hooks/useAdmin";
import { usePaidStudents } from "@/hooks/useAdminDashboard";
import StudentRow from "../../../../components/card/StudentRowAccordion";
import { useNavigate } from "react-router-dom";

const transformStudentData = (s) => {
  const _id = s?._id ?? s?.id;
  return {
  id: _id,
  _id, // giữ luôn cho chắc
  name: s.name,
  email: s.email,
  avatar: s.avatar,
  phone: s.phone,
  status: s.status || "pending",
  learningLevel: s.student_profile?.learning_level || "N/A",
  progress: s.student_profile?.progress ?? 0,
  };
};

export default function Student() {
  const navigate = useNavigate()
  // data: lấy toàn bộ học viên + danh sách đã thanh toán
  const { data: rawStudents = [], isLoading, error } = useUsersByRole("student");
  const {
    data: paidData,
    isLoading: isLoadingPaid,
    error: paidError,
  } = usePaidStudents();
  const paidSet = useMemo(() => {
    const ids = paidData?.paidStudentIds || [];
    return new Set(ids.map(String));
  }, [paidData]);

  const students = useMemo(
    () =>
      (rawStudents || []).map((s) => {
        const base = transformStudentData(s);
        const id = String(base?._id || base?.id || "");
        return { ...base, hasPaid: paidSet.has(id) };
      }),
    [rawStudents, paidSet]
  );

  // mutations
  const delMut = useDeleteUser();
  const statusMut = useUpdateStatus();

  // UI states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCoursesModal, setShowCoursesModal] = useState(false);

  // filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all|active|pending|blocked

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return students.filter((s) => {
      const matchText =
        !term ||
        (s.name || "").toLowerCase().includes(term) ||
        (s.email || "").toLowerCase().includes(term) ||
        (s.phone || "").toLowerCase().includes(term);

      const matchStatus =
        statusFilter === "all" ? true : (s.status || "pending") === statusFilter;

      return matchText && matchStatus;
    });
  }, [students, q, statusFilter]);

  if (isLoading || isLoadingPaid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (error || paidError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 font-medium">
          Không thể tải dữ liệu.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý học viên
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tổng: <b className="text-slate-700">{students.length}</b> học viên
              <span className="mx-2">•</span>
              Đã thanh toán:{" "}
              <b className="text-sky-700">{paidData?.total ?? 0}</b>
            </p>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition font-medium"
            onClick={() => navigate('/admin/create-account')}
          >
            <AddIcon fontSize="small" /> Thêm học viên
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
              <SearchIcon fontSize="small" className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên / email / số điện thoại..."
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

        {/* LIST */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-500 text-center">
            Chưa có học viên nào đã thanh toán (hoặc không khớp bộ lọc).
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <StudentRow
                key={s.id}
                student={s}
                isDeleting={delMut.isPending}
                isUpdatingStatus={statusMut.isPending}
                onViewDetail={() => {
                  setSelectedStudent(s);
                  setShowDetailModal(true);
                }}
                onViewCourses={() => {
                  setSelectedStudent(s);
                  setShowCoursesModal(true);
                }}
                onUpdateStatus={(newStatus) =>
                  statusMut.mutateAsync({ id: s.id, status: newStatus })
                }
                onDelete={(id) => delMut.mutateAsync(id)}
              />
            ))}
          </div>
        )}

        {/* MODAL: STUDENT DETAIL */}
        {showDetailModal && selectedStudent && (
          <StudentDetailModal
            studentId={selectedStudent.id}
            onClose={() => setShowDetailModal(false)}
          />
        )}

        {/* MODAL: STUDENT COURSES */}
        {showCoursesModal && selectedStudent && (
          <StudentCoursesModal
            studentId={selectedStudent.id}
            student={selectedStudent}
            onClose={() => setShowCoursesModal(false)}
          />
        )}
      </div>
    </div>
  );
}
