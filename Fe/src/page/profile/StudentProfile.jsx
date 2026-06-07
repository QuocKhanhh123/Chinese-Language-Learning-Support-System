import { LinearProgress, Avatar, Chip } from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import StarIcon from '@mui/icons-material/Star';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

export default function StudentProfile({ profile }) {
  // Default data if not provided
  const defaultStats = [
    { category: "Từ vựng HSK 1", learned: 120, total: 150, icon: <MenuBookIcon /> },
    { category: "Từ vựng HSK 2", learned: 85, total: 300, icon: <MenuBookIcon /> },
    { category: "Ngữ pháp cơ bản", learned: 25, total: 50, icon: <AutoStoriesIcon /> },
    { category: "Flashcard đã học", learned: 450, total: 600, icon: <SchoolIcon /> },
  ];

  const stats = profile?.stats || defaultStats;

  const achievements = [
    { title: "7 ngày liên tiếp", icon: <LocalFireDepartmentIcon className="text-orange-500" />, unlocked: true },
    { title: "Hoàn thành HSK 1", icon: <EmojiEventsIcon className="text-amber-500" />, unlocked: true },
    { title: "100 từ vựng", icon: <StarIcon className="text-yellow-500" />, unlocked: true },
    { title: "Quiz Master", icon: <QuizIcon className="text-blue-500" />, unlocked: false },
  ];

  const recentActivity = [
    { action: "Hoàn thành bài học", detail: "HSK 1 - Chào hỏi cơ bản", time: "2 giờ trước" },
    { action: "Ôn tập flashcard", detail: "50 thẻ từ vựng", time: "5 giờ trước" },
    { action: "Làm bài quiz", detail: "HSK 1 - Đạt 85%", time: "Hôm qua" },
  ];

  const getProgressColor = (percent) => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-32 h-32 border border-white/30 rounded-full" />
            <div className="absolute bottom-4 left-8 w-24 h-24 border border-white/20 rounded-full" />
          </div>

          <div className="relative z-10 p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    color: '#B91C1C',
                    fontWeight: 'bold',
                    border: '4px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {profile?.name?.charAt(0) || "学"}
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg">
                  <span className="text-lg font-bold">5</span>
                </div>
              </div>

              {/* User Info */}
              <div className="text-center md:text-left text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {profile?.name || "Học viên C-learning"}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <Chip
                    label="Học viên"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: '600'
                    }}
                  />
                  <Chip
                    label="HSK 2"
                    size="small"
                    sx={{
                      backgroundColor: '#FCD34D',
                      color: '#92400E',
                      fontWeight: '600'
                    }}
                  />
                </div>
                <p className="text-white/80 text-sm">
                  Tham gia từ tháng 10/2025 • Học 45 ngày liên tiếp 🔥
                </p>
              </div>

              {/* Quick Stats */}
              <div className="md:ml-auto grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <div className="text-2xl font-bold text-white">256</div>
                  <div className="text-xs text-white/70">Từ đã học</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-xs text-white/70">Bài học</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <div className="text-2xl font-bold text-white">85%</div>
                  <div className="text-xs text-white/70">Chính xác</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Progress Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingUpIcon className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Tiến độ học tập</h2>
              </div>

              <div className="space-y-5">
                {stats.map((s, i) => {
                  const percent = Math.round((s.learned / s.total) * 100);
                  return (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-red-500">{s.icon || <MenuBookIcon />}</span>
                          <span className="font-medium text-gray-800">{s.category}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {s.learned}/{s.total} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(percent)} rounded-full transition-all duration-500 group-hover:opacity-80`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <CalendarMonthIcon className="text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h2>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-red-50 transition-colors">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.detail}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors">
                Xem tất cả hoạt động →
              </button>
            </div>
          </div>

          {/* Right Column - Achievements & Stats */}
          <div className="space-y-6">
            {/* Achievements Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <EmojiEventsIcon className="text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Thành tựu</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl text-center transition-all ${achievement.unlocked
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
                      : 'bg-gray-100 opacity-50'
                      }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <p className="text-xs font-medium text-gray-700">{achievement.title}</p>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors">
                Xem tất cả thành tựu →
              </button>
            </div>

            {/* Study Streak Card */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <LocalFireDepartmentIcon className="text-3xl" />
                <div>
                  <h3 className="font-bold text-lg">Chuỗi học tập</h3>
                  <p className="text-white/80 text-sm">Duy trì mỗi ngày!</p>
                </div>
              </div>

              <div className="text-center py-4">
                <div className="text-6xl font-bold mb-2">45</div>
                <div className="text-white/90">ngày liên tiếp 🔥</div>
              </div>

              <div className="flex justify-between text-xs text-white/70 mt-4">
                <span>Kỷ lục: 60 ngày</span>
                <span>Hạng: Top 5%</span>
              </div>
            </div>

            {/* Current Level Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <span className="text-3xl font-bold">2</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">HSK Level 2</h3>
                <p className="text-sm text-gray-500 mb-4">Đang học</p>

                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">65% hoàn thành</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}