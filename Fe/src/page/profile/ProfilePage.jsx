import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/network/httpRequest";
import { LinearProgress, Avatar } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Swal from "sweetalert2";
/**
 * PROFILE PAGE – CLEAN VERSION
 * - ❌ Không đổi mật khẩu
 * - ✅ Role-based UI
 * - ✅ Phù hợp HSK / Admin
 */

export default function ProfilePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  /* ================= FETCH PROFILE ================= */
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile"],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data.data;
    },
  });

  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    name: "",
    phone: "",
    sex: "other",
    date_of_birth: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        sex: profile.sex || "other",
        date_of_birth: profile.date_of_birth
          ? profile.date_of_birth.slice(0, 10)
          : "",
      });
    }
  }, [profile]);

  /* ================= UPDATE PROFILE ================= */
  const updateProfile = useMutation({
    mutationFn: (payload) =>
      axiosInstance.put("/users/profile", payload), // ✅ FIX URL
    onSuccess: () => {
      qc.invalidateQueries(["profile"]);

      Swal.fire({
        icon: "success",
        title: "Lưu thành công",
        text: "Thông tin cá nhân đã được cập nhật",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text:
          err?.response?.data?.message ||
          "Không thể cập nhật thông tin",
      });
    },
  });

  /* ================= ADMIN USERS ================= */
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    enabled: profile?.role === "admin",
    queryFn: async () => {
      const res = await axiosInstance.get("/user/get-users");
      return res.data.data.users;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) =>
      axiosInstance.put(`/user/update-status/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries(["users"]),
  });

  const deleteUser = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/user/delete-user/${id}`),
    onSuccess: () => qc.invalidateQueries(["users"]),
  });
  const handleSave = () => {
    const payload = { ...form };

    // ❗ FIX CHÍNH: không gửi chuỗi rỗng cho Date
    if (!payload.date_of_birth) {
      delete payload.date_of_birth;
    }

    updateProfile.mutate(payload);
  };

  /* ================= CHANGE PASSWORD ================= */
  const changePassword = useMutation({
    mutationFn: (payload) => axiosInstance.put("/users/change-password", payload),
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      Swal.fire({
        icon: "success",
        title: "Đổi mật khẩu thành công",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err?.response?.data?.message || "Không thể đổi mật khẩu",
      });
    },
  });

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      return Swal.fire({ icon: "warning", title: "Vui lòng nhập đầy đủ thông tin" });
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return Swal.fire({ icon: "warning", title: "Mật khẩu xác nhận không khớp" });
    }
    if (passwordForm.newPassword.length < 6) {
      return Swal.fire({ icon: "warning", title: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }
    changePassword.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };
  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile…
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (isError) {
    const status = error?.response?.status;

    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-red-600 font-semibold text-lg">
            {status === 401
              ? "Phiên đăng nhập không hợp lệ"
              : "Không thể tải hồ sơ"}
          </p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng đăng nhập lại</p>
        </div>
      </div>
    );
  }

  if (profile.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-yellow-600 font-semibold text-lg">
            Tài khoản chưa được kích hoạt
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Trạng thái: {profile.status}
          </p>
        </div>
      </div>
    );
  }

  const role = profile.role;

  /* ================= ROLE BADGE ================= */
  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-red-600', label: 'Admin' },
      teacher: { bg: 'bg-amber-600', label: 'Giáo viên' },
      student: { bg: 'bg-green-600', label: 'Học viên' },
    };
    return badges[role] || badges.student;
  };

  const roleBadge = getRoleBadge(role);

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ===== BACK BUTTON ===== */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition text-sm"
        >
          <ArrowBackIcon fontSize="small" />
          Quay lại
        </button>

        {/* ===== HEADER ===== */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-red-700 h-24 relative">
            <div className="absolute -bottom-12 left-6">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  className="w-24 h-24 rounded-lg object-cover border-4 border-white shadow"
                  alt="avatar"
                />
              ) : (
                <Avatar
                  sx={{
                    width: 96,
                    height: 96,
                    fontSize: '2rem',
                    bgcolor: '#fef3c7',
                    color: '#b91c1c',
                    fontWeight: 'bold',
                    border: '4px solid white',
                    borderRadius: '8px'
                  }}
                >
                  {profile.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              )}
            </div>
          </div>

          <div className="pt-16 pb-6 px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{profile.name}</h1>
                <p className="text-gray-500 text-sm">{profile.email}</p>
              </div>
              <span className={`inline-block px-3 py-1 text-xs font-medium text-white rounded ${roleBadge.bg}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* ===== THÔNG TIN CÁ NHÂN ===== */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b">
            Thông tin cá nhân
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Họ tên</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nhập họ tên"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Số điện thoại"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Giới tính</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500 bg-white"
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value })}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Ngày sinh</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500"
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="mt-5 bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        {/* ===== ĐỔI MẬT KHẨU ===== */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b flex items-center gap-2">
            <LockIcon className="text-gray-500" fontSize="small" />
            Đổi mật khẩu
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500 pr-10"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500 pr-10"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-500 pr-10"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={changePassword.isPending}
            className="mt-5 bg-gray-800 text-white px-5 py-2 rounded hover:bg-gray-900 transition text-sm font-medium disabled:opacity-50"
          >
            {changePassword.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </div>

        {/* ===== TIẾN ĐỘ HỌC TẬP (Student) ===== */}
        {role === "student" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b">
              Tiến độ luyện thi HSK
            </h2>

            {profile.stats?.length ? (
              <div className="space-y-4">
                {profile.stats.map((stat, i) => {
                  const percent = Math.round((stat.learned / stat.total) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{stat.category}</span>
                        <span className="text-gray-500">{stat.learned}/{stat.total}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Chưa có dữ liệu học tập</p>
            )}
          </div>
        )}

        {/* ===== QUẢN LÝ USER (Admin) ===== */}
        {role === "admin" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b">
              Quản lý người dùng
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-2 px-3 font-medium">Email</th>
                    <th className="py-2 px-3 font-medium">Vai trò</th>
                    <th className="py-2 px-3 font-medium">Trạng thái</th>
                    <th className="py-2 px-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-800">{u.email}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 text-xs font-medium text-white rounded ${getRoleBadge(u.role).bg}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 text-xs rounded ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => updateStatus.mutate({ id: u._id, status: u.status === "active" ? "blocked" : "active" })}
                          className="text-blue-600 hover:underline text-xs mr-3"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => deleteUser.mutate(u._id)}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
