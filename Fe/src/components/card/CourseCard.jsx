import { getCourseImageSrc } from "@/utils/courseMedia";

const FALLBACK_THUMB =
  "https://upload.wikimedia.org/wikipedia/commons/1/1c/HSK-logo.jpg";

const CourseCard = ({ course, teacherName, showTeacher = true }) => {
  const {
    title,
    targetLevel,
    description,
    status,
    stats = {},
  } = course || {};

  const {
    lessonCount = 0,
    enrolledCount = 0,
    ratingAvg = 0,
    ratingCount = 0,
  } = stats;

  const isActive = status === "active";

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_THUMB;
  };

  const imageSrc = getCourseImageSrc(course, FALLBACK_THUMB);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative w-full aspect-[16/9]">
        <img
          src={imageSrc}
          alt={title || "Khóa học"}
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={handleImgError}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title + status */}
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <h2 className="font-semibold text-gray-900 text-sm line-clamp-2">
              {title}
            </h2>
            {targetLevel && (
              <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                {targetLevel}
              </span>
            )}
          </div>

          <span
            className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-500"
              }`}
          >
            {isActive ? "Đang mở" : "Bản nháp"}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-2 text-xs text-gray-600 line-clamp-2">
            {description}
          </p>
        )}

        {/* Stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-600">
          <div>
            <p className="text-gray-400">Bài học</p>
            <p className="font-semibold text-gray-800">{lessonCount}</p>
          </div>
          <div>
            <p className="text-gray-400">Học viên</p>
            <p className="font-semibold text-gray-800">{enrolledCount}</p>
          </div>
          <div>
            <p className="text-gray-400">Đánh giá</p>
            {ratingCount > 0 ? (
              <p className="font-semibold text-gray-800">
                {ratingAvg.toFixed(1)}/5
              </p>
            ) : (
              <p className="font-semibold text-gray-800">Chưa có</p>
            )}
          </div>
        </div>

        {showTeacher && (
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="truncate text-[11px] text-gray-600">
              <p className="text-gray-400">Giáo viên</p>
              <p className="font-medium text-gray-800 truncate">
                {teacherName || "Đang cập nhật"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
