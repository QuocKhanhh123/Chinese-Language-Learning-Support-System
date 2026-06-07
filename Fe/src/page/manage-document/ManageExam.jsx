import useFetchTeacherCourses from "@/hooks/useFetchTeacherCourses";
import axiosInstance from "@/network/httpRequest";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add, ArrowForward, Delete } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify"; // 🔥 chỉ dùng toast, không dùng ToastContainer ở đây
import { z } from "zod";

// ===== HSK levels =====
const HSK_LEVELS = ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"];

// Thời gian mặc định theo từng level HSK (phút)
const DEFAULT_TIME_BY_LEVEL = {
  HSK1: 40,
  HSK2: 55,
  HSK3: 90,
  HSK4: 105,
  HSK5: 125,
  HSK6: 125, // 125-140 phút (cho 125 làm default, muốn chỉnh thì nhập tay)
};

const examFormSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(100, "Tiêu đề không được quá 100 ký tự"),
  description: z
    .string()
    .min(1, "Mô tả không được để trống")
    .max(500, "Mô tả không được quá 500 ký tự"),
  courseId: z.string().min(1, "Khóa học không được để trống"),
  time_limit: z.coerce
    .number()
    .min(1, "Thời gian phải lớn hơn 0")
    .max(180, "Thời gian không được quá 180 phút"),
  level: z.enum(HSK_LEVELS, {
    required_error: "Trình độ HSK không được để trống",
  }),
});

function ManageExam() {
  const { user } = useAuthStore();
  const [openDialog, setOpenDialog] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: "",
      description: "",
      time_limit: DEFAULT_TIME_BY_LEVEL["HSK1"],
      courseId: "",
      level: "HSK1",
    },
  });

  const selectedLevel = watch("level");

  // Khi đổi HSK level -> tự set thời gian mặc định
  useEffect(() => {
    if (!selectedLevel) return;
    const defaultTime = DEFAULT_TIME_BY_LEVEL[selectedLevel];
    if (defaultTime) {
      setValue("time_limit", defaultTime);
    }
  }, [selectedLevel, setValue]);

  const { data: coursesData } = useFetchTeacherCourses();

  const handleOpenDialog = () => {
    reset({
      title: "",
      description: "",
      time_limit: DEFAULT_TIME_BY_LEVEL["HSK1"],
      courseId: "",
      level: "HSK1",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const { data: exams, refetch } = useQuery({
    queryKey: ["exams-teacher", user?._id],
    queryFn: async () => {
      const res = await axiosInstance.get("/exams/my/list");
      return res.data.data;
    },
    gcTime: 1000 * 60 * 5,
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        level: data.level,
        timeLimitMinutes: data.time_limit,
        skills: [], // để trống, sau này thêm trong màn chi tiết
        passingScore: 60,
        sections: [], // chưa có câu hỏi, để màn chi tiết xử lý
      };

      await axiosInstance.post("/exams/create-exam", payload);
      toast.success("Tạo bài thi HSK thành công");
      refetch();
      handleCloseDialog();
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    }
  };

  const onDelete = async (examId) => {
    try {
      await axiosInstance.delete(`/exams/delete-exam/${examId}`);
      toast.success("Xóa bài thi thành công");
      refetch();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Không thể xóa bài thi");
    }
  };

  const renderLevelBadge = (level) => {
    const colorMap = {
      HSK1: "bg-green-100 text-green-700",
      HSK2: "bg-emerald-100 text-emerald-700",
      HSK3: "bg-sky-100 text-sky-700",
      HSK4: "bg-blue-100 text-blue-700",
      HSK5: "bg-amber-100 text-amber-700",
      HSK6: "bg-red-100 text-red-700",
    };
    const cls = colorMap[level] || "bg-gray-100 text-gray-700";
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${cls}`}
      >
        {level}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Wrapper cho gọn vào giữa */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="error"
              sx={{
                borderBottom: "4px solid",
                borderColor: "error.main",
                display: "inline-block",
                pb: 1,
              }}
            >
              Quản lý bài thi HSK
            </Typography>
            <p className="mt-2 text-sm text-gray-500">
              Tạo và quản lý các bài thi HSK theo từng trình độ, thời lượng và
              khóa học.
            </p>
          </div>

          <button
            onClick={handleOpenDialog}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            <Add fontSize="small" />
            Tạo bài thi mới
          </button>
        </div>

        <hr className="my-4" />

        {/* Danh sách bài thi */}
        {(!exams || exams.length === 0) && (
          <div className="mt-8 flex flex-col items-center justify-center text-center text-gray-500">
            <p className="text-base font-medium">
              Chưa có bài thi HSK nào được tạo.
            </p>
            <p className="text-sm mt-1">
              Nhấn nút{" "}
              <span className="font-semibold text-red-600">
                &quot;Tạo bài thi mới&quot;
              </span>{" "}
              để bắt đầu.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {exams?.map((exam) => (
            <div
              key={exam._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  {renderLevelBadge(exam.level || "HSK1")}
                  <span className="text-xs text-gray-400">
                    {exam.status === "published" ? "Đã xuất bản" : "Nháp"}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                  {exam.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {exam.description || "Không có mô tả."}
                </p>

                <div className="mt-auto space-y-1 text-sm text-gray-500">
                  <p>
                    <span className="font-medium text-gray-700">
                      Thời gian:
                    </span>{" "}
                    {exam.timeLimitMinutes || exam.time_limit} phút
                  </p>
                  {exam.course?.title && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Khóa học:
                      </span>{" "}
                      {exam.course.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-5 py-3 bg-gray-50 flex items-center justify-between gap-2">
                <button
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  title="Xóa bài thi"
                  onClick={() => onDelete(exam._id)}
                >
                  <Delete fontSize="small" />
                </button>

                <Link
                  to={`edit/${exam._id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
                  title="Xem & chỉnh sửa chi tiết"
                >
                  Xem chi tiết
                  <ArrowForward fontSize="small" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tạo bài thi HSK mới
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Chỉ tạo khung bài thi. Phần câu hỏi sẽ được thêm ở màn chi
                  tiết.
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Grid 2 cột trên màn lớn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tiêu đề */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề
                    </label>
                    <input
                      {...register("title")}
                      placeholder="Ví dụ: HSK1 - Listening & Reading Test 01"
                      className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                        errors.title
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-red-500/70"
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Trình độ HSK */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trình độ HSK
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                        errors.level
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-red-500/70"
                      }`}
                      {...register("level")}
                    >
                      {HSK_LEVELS.map((lv) => (
                        <option key={lv} value={lv}>
                          {lv}
                        </option>
                      ))}
                    </select>
                    {errors.level && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.level.message}
                      </p>
                    )}
                  </div>

                  {/* Khóa học */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Khóa học
                    </label>
                    <select
                      {...register("courseId")}
                      className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                        errors.courseId
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-red-500/70"
                      }`}
                    >
                      <option value="">-- Chọn khóa học --</option>
                      {coursesData?.data?.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    {errors.courseId && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.courseId.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Mô tả ngắn về bài thi (ví dụ: Kiểm tra kỹ năng nghe & đọc HSK1 giữa kỳ...)"
                    className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                      errors.description
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500/70"
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Thời gian làm bài */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Ví dụ: 90"
                    {...register("time_limit")}
                    className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                      errors.time_limit
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500/70"
                    }`}
                  />
                  {errors.time_limit && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.time_limit.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Gợi ý: HSK1: 40’, HSK2: 55’, HSK3: 90’, HSK4: 105’, HSK5:
                    125’, HSK6: 125–140’
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Tạo bài thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageExam;
