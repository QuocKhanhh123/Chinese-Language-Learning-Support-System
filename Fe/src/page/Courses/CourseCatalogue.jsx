import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { LoadingOverlay, Badge, TextInput } from "@mantine/core";
import { School } from "@mui/icons-material";
import axiosInstance from "../../network/httpRequest";
import {
  COURSE_FALLBACK_IMAGE,
  getCourseImageSrc,
  hasCourseImage,
} from "@/utils/courseMedia";

const HSK_COLORS = {
  HSK1: "green", HSK2: "teal", HSK3: "blue",
  HSK4: "indigo", HSK5: "violet", HSK6: "red",
};

function useActiveCourses() {
  return useQuery({
    queryKey: ["courses", "student-catalogue"],
    queryFn: () =>
      axiosInstance
        .get("/courses/get-courses-for-student")
        .then((r) => r.data.data?.courses || r.data.data || []),
  });
}

export default function CourseCatalogue() {
  const { data: courses = [], isLoading } = useActiveCourses();
  const [search, setSearch] = useState("");

  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Khóa học HSK</h1>
      <p className="text-gray-500 mb-6">Chọn khóa học phù hợp với trình độ của bạn</p>

      <TextInput
        placeholder="Tìm kiếm khóa học..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 max-w-sm"
      />

      <div className="relative min-h-40">
        <LoadingOverlay visible={isLoading} />

        {filtered.length === 0 && !isLoading && (
          <p className="text-gray-400 text-center py-16">Không có khóa học nào.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <Link
              key={course._id}
              to={`/courses/${course._id}`}
              className="block border rounded-xl overflow-hidden hover:shadow-md transition group"
            >
              {hasCourseImage(course) ? (
                <img
                  src={getCourseImageSrc(course)}
                  alt={course.title || "Khóa học"}
                  className="w-full h-36 object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = COURSE_FALLBACK_IMAGE;
                  }}
                />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <School className="text-blue-400" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge color={HSK_COLORS[course.targetLevel] || "gray"} size="sm">
                    {course.targetLevel}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <p className="mt-3 font-bold text-blue-600">
                  {course.price > 0
                    ? `${course.price.toLocaleString("vi-VN")} ₫`
                    : "Miễn phí"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
