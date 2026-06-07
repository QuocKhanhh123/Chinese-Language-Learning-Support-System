import axiosInstance from "@/network/httpRequest";
import { useClassesByCourse, useDeleteClass, useChangeClassStatus } from "@/hooks/useClasses";
import CreateClassModal from "@/components/modal/CreateClassModal";
import EditClassModal from "@/components/modal/EditClassModal";
import {
  Badge,
  Menu,
  Switch,
  Avatar,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Add,
  ArrowBack,
  Delete,
  Settings,
  School,
  Edit,
} from "@mui/icons-material";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useCourseById } from "@/hooks/useCourses";
import { getCourseImageSrc } from "@/utils/courseMedia";

function AdminCourseDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const courseId = state?.course?._id;

  // API mới trả về { course, lessons }
  const { data: courseDetail, refetch: refetchCourse } =
    useCourseById(courseId);

  const course = courseDetail?.course || courseDetail;
  const lessons = courseDetail?.lessons || [];

  // Modals
  const [classModalOpened, { open: openClassModal, close: closeClassModal }] =
    useDisclosure(false);

  // Classes
  const { data: classes = [] } = useClassesByCourse(courseId);
  const deleteClass = useDeleteClass();
  const changeClassStatus = useChangeClassStatus();
  const [editingClass, setEditingClass] = useState(null);

  // API publish: đổi từ draft -> active
  const publishCourse = async (id) => {
    const response = await axiosInstance.patch(`/courses/publish/${id}`);
    if (response.status === 200) {
      refetchCourse();
      return true;
    }
    throw new Error("Mở lớp thất bại");
  };
  // API close: đổi từ active -> draft
  const closeCourse = async (id) => {
    const response = await axiosInstance.patch(`/courses/close/${id}`);
    if (response.status === 200) {
      refetchCourse();
      return true;
    }
    throw new Error("Tắt lớp thất bại");
  };

  const deleteCourse = async (id) => {
    const res = await axiosInstance.delete(`/courses/delete/${id}`);
    if (res.status === 200) {
      toast.success("Đã xoá khóa học!");
      navigate("/admin/courses");
    }
  };

  const levelLabel =
    course?.targetLevel || course?.title?.match(/HSK\s?\d/i)?.[0] || "HSK";

  const lessonCount = course?.stats?.lessonCount ?? lessons.length ?? 0;
  const enrolledCount = classes.reduce((sum, c) => sum + (c.studentIds?.length || c.enrolledCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f7] via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-red-50 transition text-red-600"
              title="Quay lại"
            >
              <ArrowBack fontSize="small" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900">
                  Chi tiết khóa học
                </h1>
                <Badge color="red" variant="filled" radius="sm">
                  {levelLabel}
                </Badge>
                {course?.status === "active" && (
                  <Badge color="green" variant="light" radius="sm">
                    Đang hoạt động
                  </Badge>
                )}
              </div>
              <div className="text-gray-600 text-sm">
                Quản trị khóa luyện thi HSK
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Menu shadow="md" width={220}>
              <Menu.Target>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 transition text-gray-700"
                >
                  <Settings />
                </button>
              </Menu.Target>

              <Menu.Dropdown>
                {/* Mở lớp / public: draft -> active */}
                <Menu.Item py={8}>
                  <Switch
                    label={course?.status === "active" ? "Đã mở lớp" : "Mở lớp"}
                    checked={course?.status === "active"}
                    labelPosition="left"
                    color="red"
                    onChange={async (e) => {
                      const wantOpen = e.currentTarget.checked;

                      // Muốn mở lớp (false -> true)
                      if (wantOpen && course?.status !== "active") {
                        const confirmResult = await Swal.fire({
                          title: "Xác nhận mở lớp",
                          text: "Bạn có chắc muốn mở lớp cho khóa học này?",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonColor: "#d32f2f",
                          cancelButtonColor: "#aaa",
                          confirmButtonText: "Xác nhận",
                          cancelButtonText: "Hủy",
                        });

                        if (!confirmResult.isConfirmed) return;

                        try {
                          await publishCourse(courseId);
                          toast.success("Khóa học đã được mở lớp  thành công!");
                        } catch (error) {
                          console.log(error);
                          toast.error("Có lỗi xảy ra, vui lòng thử lại!");
                        }
                        return;
                      }

                      // Muốn tắt lớp (true -> false)
                      if (!wantOpen && course?.status === "active") {
                        const confirmResult = await Swal.fire({
                          title: "Xác nhận tắt lớp",
                          text: "Bạn có chắc muốn TẮT LỚP  cho khóa học này?",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#d32f2f",
                          cancelButtonColor: "#aaa",
                          confirmButtonText: "Xác nhận",
                          cancelButtonText: "Hủy",
                        });

                        if (!confirmResult.isConfirmed) return;

                        try {
                          await closeCourse(courseId);
                          toast.success("Khóa học đã được tắt lớp thành công!");
                        } catch (error) {
                          console.log(error);
                          toast.error("Có lỗi xảy ra, vui lòng thử lại!");
                        }
                        return;
                      }
                    }}
                  />
                </Menu.Item>

                <Menu.Item py={8}>
                  <Link
                    to={`/admin/edit/${courseId}`}
                    className="text-gray-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Edit fontSize="small" />
                      Chỉnh sửa khóa học
                    </span>
                  </Link>
                </Menu.Item>

                <Menu.Item
                  py={8}
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: "Xác nhận xóa khóa học",
                      text: "Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Xóa",
                      cancelButtonText: "Hủy",
                      confirmButtonColor: "#d32f2f",
                      cancelButtonColor: "#3085d6",
                    });

                    if (result.isConfirmed) {
                      try {
                        await deleteCourse(courseId);
                        toast.success("Khóa học đã được xóa!");
                        navigate("/admin/courses");
                      } catch (err) {
                        console.log(err);
                        toast.error(
                          "Không thể xóa khóa học. Vui lòng thử lại!"
                        );
                      }
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                    <Delete fontSize="small" /> Xoá khóa học
                  </span>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>

        {/* Course cover */}
        <div className="bg-white border border-red-100 shadow-sm rounded-2xl p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {course?.thumbnail ? (
                <img
                  src={getCourseImageSrc(course)}
                  alt={course.title}
                  className="w-24 h-24 rounded-xl object-cover border border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <School />
                </div>
              )}

              <div>
                <div className="text-gray-500 text-sm">Tên khóa học</div>
                <div className="text-xl font-bold text-gray-900">
                  {course?.title || "---"}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge color="red" variant="light">
                    {levelLabel}
                  </Badge>
                  <Badge color="gray" variant="light">
                    {lessonCount} bài học
                  </Badge>
                  <Badge color="gray" variant="light">
                    {enrolledCount} học viên
                  </Badge>
                </div>
              </div>
            </div>

            {/* Buttons "Thêm học viên" và "Đổi giáo viên" đã được chuyển sang luồng mới qua Class */}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            Mô tả khóa học
          </h2>
          <p className="leading-7 text-gray-800 whitespace-pre-wrap">
            {course?.description || "Chưa có mô tả."}
          </p>
        </div>

        {/* Teacher block removed per request */}

        {/* Lessons */}
        {/* <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MenuBook className="text-red-600" />
              <h2 className="text-base font-bold text-gray-900">
                Danh sách bài học
              </h2>
              <Badge color="red" variant="filled" radius="sm">
                {lessonCount}
              </Badge>
            </div>

            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 font-semibold flex items-center gap-2"
              onClick={() =>
                navigate(`/admin/lessons/create`, { state: { courseId } })
              }
            >
              <Add fontSize="small" /> Thêm bài học
            </button>
          </div>

          {lessons?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition bg-[#fffdf7]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Bài {lesson.order}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {lesson.title}
                      </div>
                      <div className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {lesson.description}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        color={lesson.status === "active" ? "green" : "gray"}
                        variant="light"
                        radius="sm"
                      >
                        {lesson.status === "active" ? "Đang mở" : "Ẩn"}
                      </Badge>

                      <Badge
                        color={lesson.video_url ? "red" : "gray"}
                        variant="light"
                        radius="sm"
                        leftSection={<PlayCircle fontSize="small" />}
                      >
                        {lesson.video_url ? "Có video" : "Chưa có video"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
                      onClick={() =>
                        navigate(`/admin/lessons/${lesson._id}`, {
                          state: { lesson },
                        })
                      }
                    >
                      Xem chi tiết
                    </button>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800 text-sm font-semibold"
                      onClick={() =>
                        navigate(`/admin/lessons/edit/${lesson._id}`, {
                          state: { lesson },
                        })
                      }
                    >
                      Sửa bài
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500 italic">
              Chưa có bài học nào trong khóa này.
            </div>
          )}
        </div> */}


        {/* ===== SECTION LỚP HỌC ===== */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Lớp học</h2>
            <button
              onClick={openClassModal}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              <Add fontSize="small" /> Thêm lớp
            </button>
          </div>

          {classes.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center border rounded-xl">
              Chưa có lớp học nào. Nhấn &quot;Thêm lớp&quot; để tạo.
            </p>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => {
                const STATUS_OPTIONS = [
                  { value: "open", label: "Mở đăng ký" },
                  { value: "closed", label: "Đóng đăng ký" },
                  { value: "ongoing", label: "Đang diễn ra" },
                  { value: "finished", label: "Kết thúc" },
                ];
                return (
                  <div
                    key={cls._id}
                    className="border rounded-xl p-4 bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{cls.name}</p>
                        <p className="text-sm text-gray-500">
                          GV: {cls.teacher?.name} &nbsp;|&nbsp;
                          SV: {cls.studentIds?.length || 0}/{cls.maxStudents}
                        </p>
                        {/* Status dropdown */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">Trạng thái:</span>
                          <select
                            value={cls.status}
                            onChange={async (e) => {
                              try {
                                await changeClassStatus.mutateAsync({ classId: cls._id, status: e.target.value });
                                toast.success(`Đã đổi trạng thái thành "${e.target.value}"`);
                              } catch (err) {
                                toast.error(err?.response?.data?.message || "Lỗi khi đổi trạng thái");
                              }
                            }}
                            style={{
                              padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                              border: "1px solid #e5e7eb", outline: "none", cursor: "pointer"
                            }}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 self-start">
                        <button
                          onClick={() => setEditingClass(cls)}
                          className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-semibold transition"
                          title="Sửa lớp"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: "Xóa lớp học?",
                              text: "Chỉ có thể xóa lớp chưa có học viên.",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Xóa",
                              cancelButtonText: "Hủy",
                              confirmButtonColor: "#ef4444",
                            });
                            if (result.isConfirmed) {
                              try {
                                await deleteClass.mutateAsync(cls._id);
                                toast.success("Đã xóa lớp học");
                              } catch (err) {
                                toast.error(err?.response?.data?.message || "Xóa thất bại");
                              }
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                          title="Xóa lớp"
                        >
                          <Delete fontSize="small" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal tạo lớp */}
        <CreateClassModal
          opened={classModalOpened}
          onClose={closeClassModal}
          courseId={courseId}
        />

        {/* Modal sửa lớp */}
        <EditClassModal
          opened={!!editingClass}
          onClose={() => setEditingClass(null)}
          cls={editingClass}
        />

      </div>
    </div>
  );
}

export default AdminCourseDetail;
