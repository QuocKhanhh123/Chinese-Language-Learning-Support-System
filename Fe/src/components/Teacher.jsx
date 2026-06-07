import { useEffect, useState } from 'react'
import TeacherCard from '@/components/TeacherCard'
import TeacherCoursesModal from '@/components/TeacherCoursesModal/TeacherCoursesModal'
import TeacherDetailModal from '@/components/TeacherDetailModal/TeacherDetailModal'
import { useTeachers } from '@/hooks/useTeacher'
import AddIcon from '@mui/icons-material/Add'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import VisibilityIcon from '@mui/icons-material/Visibility'

const transformTeacherData = (teacher) => ({
    id: teacher._id,
    name: teacher.name,
    email: teacher.email,
    avatar:
        teacher.avatar ||
        'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
    phone: teacher.phone,
    status: teacher.status,
    experienceYears: teacher.teacher_profile?.experience_years || 0,
    subjects: teacher.teacher_profile?.subjects || [],
    certificates: teacher.teacher_profile?.certificates || [],
    bio: teacher.teacher_profile?.bio || '',
})

const Teacher = () => {
    const { data, isLoading, error } = useTeachers()
    const [teachers, setTeachers] = useState([])
    const [selectedTeacher, setSelectedTeacher] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showCoursesModal, setShowCoursesModal] = useState(false)

    useEffect(() => {
        if (data) {
            setTeachers(data.map(transformTeacherData))
        }
    }, [data])
    console.log(selectedTeacher)

    const handleViewDetail = (teacher) => {
        setSelectedTeacher(teacher)
        setShowDetailModal(true)
    }

    const handleViewCourses = (teacher) => {
        setSelectedTeacher(teacher)
        setShowCoursesModal(true)
    }

    const handleCloseModals = () => {
        setSelectedTeacher(null)
        setShowDetailModal(false)
        setShowCoursesModal(false)
    }

    const handleStatusUpdated = (id, newStatus) => {
        setTeachers((prev) =>
            prev.map((teacher) =>
                teacher.id === id ? { ...teacher, status: newStatus } : teacher
            )
        )
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-pink-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-400"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-red-600 text-center mt-10">
                Lỗi tải dữ liệu giáo viên.
            </div>
        )
    }

    return (
        <div className="bg-pink-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-baseline space-x-3">
                        <h1 className="text-3xl font-semibold text-pink-700">
                            🌸 Giáo viên
                        </h1>
                        <span className="text-pink-500 text-lg font-medium bg-pink-100 px-3 py-1 rounded-full select-none">
                            {teachers.length}
                        </span>
                    </div>
                    <button
                        className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg px-5 py-3 shadow-md transition-transform transform hover:scale-105"
                        aria-label="Thêm Giáo Viên"
                    >
                        <AddIcon fontSize="medium" />
                        Thêm Giáo Viên
                    </button>
                </div>

                {/* Grid giáo viên */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {teachers.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="bg-white rounded-xl shadow-lg border border-pink-200 p-6 hover:shadow-2xl transition-shadow cursor-pointer"
                        >
                            <TeacherCard
                                teacher={teacher}
                                onStatusUpdated={handleStatusUpdated}
                            />
                            <div className="mt-5 flex justify-between">
                                <button
                                    onClick={() => handleViewDetail(teacher)}
                                    className="flex items-center text-pink-600 hover:text-pink-800 text-sm font-semibold"
                                >
                                    <VisibilityIcon
                                        fontSize="small"
                                        className="mr-1"
                                    />
                                    Xem chi tiết
                                </button>
                                <button
                                    onClick={() => handleViewCourses(teacher)}
                                    className="flex items-center text-green-600 hover:text-green-800 text-sm font-semibold"
                                >
                                    <LibraryBooksIcon
                                        fontSize="small"
                                        className="mr-1"
                                    />
                                    Khoá học
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showDetailModal && selectedTeacher && (
                <TeacherDetailModal
                    teacherId={selectedTeacher.id}
                    onClose={handleCloseModals}
                />
            )}

            {showCoursesModal && selectedTeacher && (
                <TeacherCoursesModal
                    teacherId={selectedTeacher.id}
                    onClose={handleCloseModals}
                />
            )}
        </div>
    )
}

export default Teacher
