import { LinearProgress } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useProfile } from "../../hooks/useProfile";

export default function ProfileUser() {
  const { data: profile, isLoading } = useProfile();
console.log(profile);

  if (isLoading) return <div>Loading...</div>;

  const role = profile.roles; // "student" | "teacher" | "admin"

  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* ================= BASIC INFO (ALL ROLES) ================= */}
      <section className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center gap-6">
          {profile.avatar ? (
            <img src={profile.avatar} className="w-24 h-24 rounded-full" />
          ) : (
            <AccountCircleIcon sx={{ fontSize: 96 }} />
          )}

          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
              Role: {role.toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      {/* ================= STUDENT BLOCK ================= */}
      {role === "student" && (
        <section className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-4 text-red-600">
            Tiến độ học tập
          </h3>

          {profile.stats.map((stat, i) => {
            const percent = Math.round(
              (stat.learned / stat.total) * 100
            );
            return (
              <div key={i} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{stat.category}</span>
                  <span>{stat.learned}/{stat.total}</span>
                </div>
                <LinearProgress value={percent} variant="determinate" />
              </div>
            );
          })}
        </section>
      )}

      {/* ================= TEACHER BLOCK ================= */}
      {role === "teacher" && (
        <section className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-4 text-blue-600">
            Thông tin giảng dạy
          </h3>

          <ul className="text-sm space-y-2">
            <li>📘 Số khoá đang dạy: {profile.totalCourses}</li>
            <li>👥 Số học viên: {profile.totalStudents}</li>
            <li>⭐ Đánh giá: {profile.rating || "Chưa có"}</li>
          </ul>
        </section>
      )}

      {/* ================= ADMIN BLOCK ================= */}
      {role === "admin" && (
        <section className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-4 text-purple-600">
            Quản trị hệ thống
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="btn-admin">Tạo user</button>
            <button className="btn-admin">Danh sách user</button>
            <button className="btn-admin">Phân quyền</button>
            <button className="btn-admin">Thống kê</button>
          </div>
        </section>
      )}
    </div>
  );
}