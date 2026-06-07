import React, { useMemo } from 'react'
import {
  People,
  Book,
  Movie,
  Description,
  TrendingUp,
  School,
  AssignmentTurnedIn,
} from '@mui/icons-material'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const COLORS = ['#ef4444', '#0ea5e9', '#22c55e', '#a855f7', '#f59e0b']

/* ================= STAT CARD ================= */
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </div>
)

/* ================= INFO CARD ================= */
const InfoCard = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-semibold text-gray-800">{value}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
)

/* ================= CHART CARD ================= */
const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="mb-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
    {children}
  </div>
)

/* ================= MAIN DASH ================= */
const MainDash = () => {
  const { data: dashboard, isLoading } = useAdminDashboard()

  /* -------- STATS -------- */
  const users = dashboard?.users || {}
  const courses = dashboard?.courses || {}
  const enrollments = dashboard?.enrollments || {}
  const exams = dashboard?.exams || {}
  const content = dashboard?.content || {}

  const totalUsers = users?.total || 0
  const activeUsers =
    (users?.active?.students || 0) + (users?.active?.teachers || 0)

  const stats = [
    {
      title: 'Giáo viên',
      value: users?.teachers || 0,
      icon: <People className="text-red-600" />,
      color: 'bg-red-100',
    },
    {
      title: 'Học viên',
      value: users?.students || 0,
      icon: <Book className="text-blue-600" />,
      color: 'bg-blue-100',
    },
    {
      title: 'Khoá học',
      value: courses?.total || 0,
      icon: <Movie className="text-green-600" />,
      color: 'bg-green-100',
    },
    {
      title: 'Người dùng hoạt động',
      value: activeUsers,
      icon: <Description className="text-purple-600" />,
      color: 'bg-purple-100',
    },
  ]

  /* -------- CHART DATA -------- */
  const userCompareChart = useMemo(
    () => [
      { name: 'Học viên', value: users?.students || 0 },
      { name: 'Giáo viên', value: users?.teachers || 0 },
    ],
    [users?.students, users?.teachers]
  )

  const courseStatusChart = useMemo(
    () => [
      { name: 'Đang hoạt động', value: courses?.active || 0 },
      { name: 'Bản nháp', value: courses?.draft || 0 },
      { name: 'Lưu trữ', value: courses?.archived || 0 },
    ],
    [courses?.active, courses?.draft, courses?.archived]
  )

  const levelChart = useMemo(() => {
    const levels = dashboard?.learningLevels || []
    return levels
      .slice()
      .sort((a, b) => String(a.level).localeCompare(String(b.level)))
      .map((l) => ({ name: l.level || 'Khác', total: l.count || 0 }))
  }, [dashboard?.learningLevels])

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải dữ liệu...
      </div>
    )
  }

  return (
    <main className="flex-1 p-6 bg-gray-100 space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Tổng quan hệ thống
        </h2>
      
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* QUICK INSIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InfoCard
          title="Tổng người dùng"
          value={totalUsers}
          subtitle="Học viên + Giáo viên"
        />
        <InfoCard
          title="Tỷ lệ hoạt động"
          value={
            totalUsers
              ? `${Math.round((activeUsers / totalUsers) * 100)}%`
              : '0%'
          }
          subtitle="Active users"
        />
        <InfoCard
          title="TB khoá / giáo viên"
          value={
            (users?.teachers || 0)
              ? ((courses?.total || 0) / (users?.teachers || 1)).toFixed(1)
              : 0
          }
          subtitle="Course per teacher"
        />
        <InfoCard
          title="Ghi danh"
          value={enrollments?.total || 0}
          subtitle="Tổng lượt ghi danh"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LINE */}
        <ChartCard title="So sánh người dùng" subtitle="Số lượng theo vai trò">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={userCompareChart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="value" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PIE */}
        <ChartCard title="Tỷ lệ người dùng" subtitle="Học viên vs Giáo viên">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={userCompareChart}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {userCompareChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* BAR */}
        <ChartCard title="Trạng thái khoá học" subtitle="Active / Draft / Archived">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={courseStatusChart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#0ea5e9"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="Khoá học theo cấp độ" subtitle="Phân bố theo targetLevel">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={levelChart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Nội dung hệ thống" subtitle="Tổng số tài nguyên">
          <div className="grid grid-cols-2 gap-4">
            <InfoCard title="Từ vựng" value={content?.vocabulary || 0} />
            <InfoCard title="Ngữ pháp" value={content?.grammar || 0} />
            <InfoCard title="Bài học" value={content?.lessons || 0} />
            <InfoCard title="Flashcards" value={content?.flashcards || 0} />
          </div>
        </ChartCard>

        <ChartCard title="Thi cử" subtitle="Tổng quan bài thi">
          <div className="grid grid-cols-2 gap-4">
            <InfoCard title="Bài thi" value={exams?.total || 0} />
            <InfoCard title="Đã publish" value={exams?.published || 0} />
            <InfoCard title="Lượt làm bài" value={exams?.attempts || 0} />
            <InfoCard title="Đơn đã thanh toán" value="Xem tab Học viên" subtitle="Theo đơn hàng paid" />
          </div>
        </ChartCard>
      </div>

      {/* SYSTEM SUMMARY */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <TrendingUp className="text-green-600" />
          Nhận định hệ thống
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Nền tảng đang có <b>{users?.students || 0}</b> học viên và{' '}
          <b>{users?.teachers || 0}</b> giáo viên. Tổng số{' '}
          <b>{courses?.total || 0}</b> khoá học đang được quản lý.
          Tỷ lệ người dùng hoạt động đạt{' '}
          <b>
            {totalUsers
              ? Math.round((activeUsers / totalUsers) * 100)
              : 0}
            %
          </b>
          . Tổng lượt ghi danh hiện tại là <b>{enrollments?.total || 0}</b>.
        </p>
      </div>
    </main>
  )
}

export default MainDash