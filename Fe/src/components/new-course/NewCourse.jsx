// NewCourse.jsx
import ImageUpload from '@/components/image-upload/ImageUpload'
import axiosInstance from '@/network/httpRequest'
import useAuthStore from '@/store/useAuthStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { useUsers } from '@/hooks/useUsers' // hook lấy /users/get-users
import { useCourseById } from '@/hooks/useCourses' // dùng để load course khi edit
import { ArrowBack } from '@mui/icons-material' // 👈 thêm import nút back

const TARGET_LEVELS = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']

const courseSchema = z.object({
  title: z.string().min(3, 'Tên khóa học phải có ít nhất 3 ký tự'),
  description: z
    .string()
    .min(10, 'Mô tả khóa học phải có ít nhất 10 ký tự'),
  assignedTeacher: z
    .string()
    .min(1, 'Vui lòng chọn giáo viên phụ trách'),
  targetLevel: z.enum(TARGET_LEVELS, {
    errorMap: () => ({ message: 'Vui lòng chọn cấp độ HSK' }),
  }),
  price: z.coerce.number().min(0, 'Học phí không hợp lệ').optional(),
})

function NewCourse({ isEditMode }) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const navigate = useNavigate()
  const [thumbnail, setThumbnail] = useState()
  const { courseId } = useParams()

  // Xác định admin: hỗ trợ cả role và roles
  const isAdmin =
    user &&
    (
      user.role === 'admin' ||
      user.roles === 'admin' ||
      (Array.isArray(user.roles) && user.roles.includes('admin'))
    )

  // Lấy danh sách user để chọn giáo viên
  const { data: users, isLoading: isUsersLoading } = useUsers()
  const teacherOptions = useMemo(
    () => users?.filter((u) => u.role === 'teacher') || [],
    [users]
  )

  // Nếu là edit mode -> load course hiện tại
  const {
    data: courseDetail,
    isLoading: isCourseLoading,
  } = useCourseById(isEditMode ? courseId : null)

  const currentCourse = courseDetail?.course || courseDetail

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTeacher: '',
      targetLevel: 'HSK1',
      price: 0,
    },
  })

  // Khi edit mode và đã load được course -> fill form
  useEffect(() => {
    if (isEditMode && currentCourse) {
      reset({
        title: currentCourse.title || '',
        description: currentCourse.description || '',
        assignedTeacher:
          currentCourse.assignedTeacher?._id ||
          currentCourse.assignedTeacher ||
          '',
        targetLevel: currentCourse.targetLevel || 'HSK1',
        price: currentCourse.price || 0,
      })
      setThumbnail(currentCourse.thumbnail) // gán ảnh cũ cho ImageUpload
    }
  }, [isEditMode, currentCourse, reset])

  const onSubmit = async (data) => {
    setSubmitting(true)
    setApiError(null)

    const payload = {
      title: data.title,
      description: data.description,
      assignedTeacher: data.assignedTeacher,
      targetLevel: data.targetLevel,
      thumbnail,
      price: data.price || 0,
    }

    try {
      const url = isEditMode
        ? `/courses/update/${courseId}` // đúng với backend
        : '/courses/create'

      const method = isEditMode
        ? axiosInstance.put
        : axiosInstance.post

      const response = await method(url, payload)

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(
          isEditMode
            ? 'Không thể lưu chỉnh sửa. Vui lòng thử lại!'
            : 'Không thể tạo khóa học. Vui lòng thử lại!'
        )
      }

      alert(
        isEditMode
          ? 'Khóa học đã được cập nhật thành công!'
          : 'Khóa học đã được tạo thành công!'
      )

      queryClient.invalidateQueries({
        queryKey: ['getCourseLecturer', user?._id],
      })
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['courseById', courseId] })
      }

      navigate(-1)
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
        error.message ||
        'Đã xảy ra lỗi khi lưu khóa học. Vui lòng thử lại!'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Loading khi đang load dữ liệu course để edit
  if (isEditMode && isCourseLoading) {
    return (
      <div className="p-10 w-full flex justify-center">
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl">
          <p>Đang tải dữ liệu khóa học...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-10 w-full px-4 flex justify-center">
      <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl space-y-8">
        {/* HEADER + NÚT BACK */}
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition"
            title="Quay lại"
          >
            <ArrowBack fontSize="small" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {isEditMode ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditMode
                ? 'Nhập thông tin khóa học HSK và cấp độ.'
                : 'Nhập thông tin khóa học HSK, chọn giáo viên và cấp độ.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: text fields */}
            <div className="md:col-span-2 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khóa học
                </label>
                <input
                  {...register('title')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Khóa học HSK 1 - Cơ bản"
                  readOnly={!isAdmin}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả khóa học
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mô tả: số từ vựng, ngữ pháp, đối tượng học..."
                  readOnly={!isAdmin}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Teacher + level + price */}
              <div className={`grid grid-cols-1 ${isEditMode ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                {/* Teacher */}
                {isEditMode ? (
                  <input type="hidden" {...register('assignedTeacher')} />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giáo viên phụ trách
                    </label>
                    <select
                      {...register('assignedTeacher')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      disabled={isUsersLoading || !isAdmin}
                    >
                      <option value="">-- Chọn giáo viên --</option>
                      {teacherOptions.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.email})
                        </option>
                      ))}
                    </select>
                    {errors.assignedTeacher && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.assignedTeacher.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Target level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cấp độ HSK
                  </label>
                  <select
                    {...register('targetLevel')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={!isAdmin}
                  >
                    {TARGET_LEVELS.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                  {errors.targetLevel && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.targetLevel.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Học phí (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('price')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="VD: 500000"
                    readOnly={!isAdmin}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: thumbnail */}
            <div>
              <ImageUpload
                thumb={thumbnail}
                onImageUpload={setThumbnail}
              />
              <p className="mt-2 text-xs text-gray-400">
                Ảnh bìa khóa học (tùy chọn, có thể để trống).
              </p>
            </div>
          </div>

          {apiError && (
            <p className="text-red-500 text-center">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !isAdmin}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:from-red-600 hover:to-red-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {submitting
              ? 'Đang lưu...'
              : isEditMode
              ? 'Lưu chỉnh sửa'
              : 'Lưu khóa học'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default NewCourse
