import axiosInstance from '@/network/httpRequest'
import { ArrowBack, Visibility } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

function ExamReport() {
    const { examId } = useParams()
    const navigate = useNavigate()

    // API: Lấy danh sách học viên tham gia bài thi
    const getStudentJoinedExam = async () => {
        const res = await axiosInstance.get(`/exams/${examId}/students`)
        return res.data.data || []
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ['exam-students', examId],
        queryFn: getStudentJoinedExam,
        refetchOnWindowFocus: false,
    })

    if (isLoading) return <div>Đang tải dữ liệu...</div>
    if (isError) return <div>Có lỗi khi tải dữ liệu.</div>
    if (!data || data.length === 0) return <div>Không có học viên tham gia.</div>

    return (
        <div className="p-6">

            {/* Back Button */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    className="p-2 text-primary rounded-full shadow-sm hover:bg-gray-100"
                    onClick={() => navigate(-1)}
                    title="Quay lại"
                >
                    <ArrowBack />
                </button>
                <h1 className="text-2xl font-bold">Báo cáo bài thi</h1>
            </div>

            <hr className="my-6" />

            <p className="mb-4 text-lg font-semibold italic text-gray-600">
                Có {data.length} học viên tham gia:
            </p>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <th className="px-4 py-3 w-[40px]">#</th>
                            <th className="px-4 py-3">Tên</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Điểm</th>
                            <th className="px-4 py-3">Thời gian (phút)</th>
                            <th className="px-4 py-3">Kết quả</th>
                            <th className="px-4 py-3 w-[70px]"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((student, index) => (
                            <tr
                                key={student.userId}
                                className={`border-t text-center ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                            >
                                <td className="px-4 py-3 font-semibold">{index + 1}</td>

                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {student.name}
                                </td>

                                <td className="px-4 py-3">{student.email}</td>

                                <td className="px-4 py-3 font-bold text-primary">
                                    {student.totalScore}
                                </td>

                                <td className="px-4 py-3">{student.timeSpent}</td>

                                <td className="px-4 py-3">
                                    {student.isPassed ? (
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                                            Đạt
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                                            Không đạt
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    <Link
                                        to={`/manage-document/exam/edit/${examId}/report/${student.userId}`}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Xem chi tiết"
                                    >
                                        <Visibility />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default ExamReport