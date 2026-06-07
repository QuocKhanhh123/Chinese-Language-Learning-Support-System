import React from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

/* =============== Decorative Components =============== */
const ChinesePattern = ({ className = "" }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" />
    </svg>
);

const Lantern = ({ className = "" }) => (
    <svg className={className} viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="20" width="40" height="60" rx="20" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
        <rect x="18" y="15" width="24" height="8" rx="2" fill="#7F1D1D" />
        <rect x="18" y="77" width="24" height="8" rx="2" fill="#7F1D1D" />
        <line x1="30" y1="0" x2="30" y2="15" stroke="#7F1D1D" strokeWidth="3" />
        <line x1="30" y1="85" x2="30" y2="110" stroke="#D97706" strokeWidth="4" />
        <circle cx="30" cy="115" r="4" fill="#D97706" />
        <text x="30" y="55" textAnchor="middle" fill="#FEE2E2" fontSize="16" fontFamily="serif">福</text>
    </svg>
);

const Event = () => {
    // Lịch thi HSK 2025-2026
    const hskSchedule = [
        { date: "15/03/2025", levels: "HSK 1-6", location: "Hà Nội, TP.HCM", status: "Đã kết thúc" },
        { date: "12/04/2025", levels: "HSK 1-6", location: "Hà Nội, TP.HCM, Đà Nẵng", status: "Đã kết thúc" },
        { date: "17/05/2025", levels: "HSK 1-6", location: "Toàn quốc", status: "Đã kết thúc" },
        { date: "21/06/2025", levels: "HSK 1-6", location: "Hà Nội, TP.HCM", status: "Đã kết thúc" },
        { date: "19/07/2025", levels: "HSK 1-6", location: "Toàn quốc", status: "Đã kết thúc" },
        { date: "16/08/2025", levels: "HSK 1-6", location: "Hà Nội, TP.HCM", status: "Đã kết thúc" },
        { date: "13/09/2025", levels: "HSK 1-6", location: "Toàn quốc", status: "Đã kết thúc" },
        { date: "18/10/2025", levels: "HSK 1-6", location: "Hà Nội, TP.HCM, Đà Nẵng", status: "Đã kết thúc" },
        { date: "15/11/2025", levels: "HSK 1-6", location: "Toàn quốc", status: "Đã kết thúc" },
        { date: "13/12/2025", levels: "HSK 1-6", location: "Hà Nội, TP.HCM", status: "Đã kết thúc" },
        { date: "10/01/2026", levels: "HSK 1-6", location: "Toàn quốc", status: "Đã kết thúc" },
        { date: "14/02/2026", levels: "HSK 1-6", location: "Hà Nội, TP.HCM", status: "Sắp diễn ra" },
        { date: "14/03/2026", levels: "HSK 1-6", location: "Toàn quốc", status: "Đăng ký mở" },
        { date: "11/04/2026", levels: "HSK 1-6", location: "Hà Nội, TP.HCM, Đà Nẵng", status: "Đăng ký mở" },
    ];

    const upcomingEvents = [
        {
            title: "Workshop: Bí quyết đạt HSK 5 trong 6 tháng",
            date: "22/02/2026",
            time: "14:00 - 16:30",
            location: "Online qua Zoom",
            speaker: "Thầy Vương Minh - 10 năm kinh nghiệm",
            spots: 45,
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400"
        },
        {
            title: "Lớp luyện đề HSK 4 - Khóa Xuân 2026",
            date: "01/03/2026 - 30/04/2026",
            time: "19:00 - 21:00 (T3, T5, T7)",
            location: "C-learning Center, Q.1, TP.HCM",
            speaker: "Cô Lý Hoa - Giảng viên ĐH Bắc Kinh",
            spots: 20,
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400"
        },
        {
            title: "Cuộc thi Hùng biện tiếng Trung 2026",
            date: "15/04/2026",
            time: "08:00 - 17:00",
            location: "Nhà Văn hóa Thanh Niên, Hà Nội",
            speaker: "Giải thưởng: 50 triệu VNĐ",
            spots: 100,
            image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 via-orange-50 to-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white py-20 px-4">
                {/* Decorative Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <ChinesePattern className="absolute top-10 left-10 w-32 h-32 text-white opacity-20" />
                    <ChinesePattern className="absolute bottom-10 right-10 w-40 h-40 text-white opacity-15" />
                    <Lantern className="absolute left-4 top-4 h-24 opacity-60 animate-pulse" />
                    <Lantern className="absolute right-8 top-8 h-20 opacity-50" />
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
                        <CalendarMonthIcon className="text-xl" />
                        <span>Lịch thi HSK 2025-2026 đã cập nhật</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        Sự kiện & Lịch thi HSK
                        <span className="block text-amber-300 mt-2">C-learning</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
                        Cập nhật lịch thi HSK chính thức, tham gia workshop miễn phí,
                        và nhận tài liệu ôn thi độc quyền từ đội ngũ giảng viên C-learning.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-4 bg-white text-red-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-amber-50 transition-all transform hover:-translate-y-1">
                            <CalendarMonthIcon className="mr-2" />
                            Xem lịch thi HSK
                        </button>
                        <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all">
                            <CardGiftcardIcon className="mr-2" />
                            Nhận tài liệu miễn phí
                        </button>
                    </div>
                </div>
            </section>

            {/* HSK Schedule Section */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
                            📅 LỊCH THI CHÍNH THỨC
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Lịch thi HSK 2025 - 2026
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Cập nhật mới nhất từ Viện Khảo thí Hán ngữ Quốc tế (Hanban).
                            Đăng ký trước ít nhất 30 ngày để đảm bảo có chỗ thi.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Ngày thi</th>
                                        <th className="px-6 py-4 text-left font-semibold">Cấp độ</th>
                                        <th className="px-6 py-4 text-left font-semibold">Địa điểm</th>
                                        <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {hskSchedule.map((exam, index) => (
                                        <tr key={index} className="hover:bg-red-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <CalendarMonthIcon className="text-red-500" />
                                                    <span className="font-medium text-gray-900">{exam.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                                    {exam.levels}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <LocationOnIcon className="text-gray-400 text-sm" />
                                                    {exam.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${exam.status === "Đăng ký mở"
                                                    ? "bg-green-100 text-green-700"
                                                    : exam.status === "Sắp diễn ra"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                    {exam.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            * Lịch thi có thể thay đổi theo thông báo từ Hanban. Vui lòng theo dõi thường xuyên.
                        </p>
                    </div>
                </div>
            </section>

            {/* Upcoming Events Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-red-50 to-orange-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
                            🎯 SỰ KIỆN SẮP TỚI
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Workshop & Khóa học đặc biệt
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Tham gia các sự kiện học tập độc quyền từ C-learning,
                            được giảng dạy bởi các giáo viên bản ngữ và chuyên gia HSK.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {upcomingEvents.map((event, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-red-100">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                        {event.title}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarMonthIcon className="text-red-500 text-lg" />
                                            <span>{event.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AccessTimeIcon className="text-red-500 text-lg" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LocationOnIcon className="text-red-500 text-lg" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <PersonIcon className="text-red-500 text-lg" />
                                            <span>{event.speaker}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            Còn {event.spots} chỗ
                                        </span>
                                        <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
                                            Đăng ký ngay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <Lantern className="absolute left-10 top-0 h-28 opacity-40" />
                    <Lantern className="absolute right-16 top-4 h-24 opacity-30" />
                    <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Bắt đầu hành trình HSK ngay hôm nay!
                    </h2>
                    <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                        Tham gia cộng đồng 50,000+ học viên đang chinh phục HSK cùng C-learning.
                        Nhận ngay bộ tài liệu ôn thi HSK miễn phí khi đăng ký.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-4 bg-white text-red-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-amber-50 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                            <TrendingUpIcon />
                            Đăng ký học miễn phí
                        </button>
                        <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center gap-2">
                            <GroupsIcon />
                            Tham gia cộng đồng
                        </button>
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-white/80">
                        <span className="flex items-center gap-2">
                            <VerifiedIcon className="text-amber-300" /> Cam kết chất lượng
                        </span>
                        <span className="flex items-center gap-2">
                            <VerifiedIcon className="text-amber-300" /> Giáo viên bản ngữ
                        </span>
                        <span className="flex items-center gap-2">
                            <VerifiedIcon className="text-amber-300" /> Hỗ trợ 24/7
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Event;