import React from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "@/network/httpRequest";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const rolesOptions = [
    { label: "Học viên", value: "student" },
    { label: "Giáo viên", value: "teacher" },
];

const formatDateToDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
};

const CreateUserForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const payload = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                sex: data.sex,
                role: data.role,
                date_of_birth: formatDateToDDMMYYYY(data.date_of_birth) || "",
            };

            const res = await axiosInstance.post("/users/create-user", payload);
            if (res.status == 200 || res.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Tạo tài khoản thành công!",
                    html: `
                    <p>Email: <strong>${data.email}</strong></p>
                    <p>Vai trò: <strong>${data.role}</strong></p>
                    <p>Tài khoản đã được thêm vào hệ thống.</p>
                `,
                    confirmButtonColor: "#B91C1C",
                });
            }
            reset();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Tạo tài khoản thất bại!",
                text:
                    error?.res?.data?.message ||
                    "Đã xảy ra lỗi, vui lòng thử lại.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200"
            >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Tạo tài khoản mới
                </h2>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {/* Họ tên */}
                    <div className="col-span-2">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Họ tên
                        </label>
                        <input
                            type="text"
                            placeholder="Nguyễn Văn A"
                            {...register("name", { required: "Họ tên là bắt buộc" })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="hocvien@email.com"
                            {...register("email", {
                                required: "Email là bắt buộc",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Email không hợp lệ",
                                },
                            })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                        {errors.email && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            placeholder="0357635003"
                            {...register("phone", {
                                required: "Số điện thoại là bắt buộc",
                            })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                        {errors.phone && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    {/* Ngày sinh */}
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            {...register("date_of_birth")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                    </div>

                    {/* Giới tính */}
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Giới tính
                        </label>
                        <select
                            {...register("sex")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        >
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    {/* Vai trò */}
                    <div className="col-span-2">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Vai trò
                        </label>
                        <select
                            {...register("role", { required: "Chọn vai trò" })}
                            defaultValue=""
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        >
                            <option value="" disabled>
                                -- Chọn vai trò --
                            </option>
                            {rolesOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.role.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="col-span-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateUserForm;