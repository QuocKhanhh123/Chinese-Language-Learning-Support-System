import { useStudentById } from "@/hooks/useStudents";
import React from "react";

const StudentDetailModal = ({ studentId, onClose }) => {
    const { data, isLoading, error } = useStudentById(studentId);
    const s = data || {};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[420px] relative">

                {/* Close btn */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
                >
                    ✖
                </button>

                <h2 className="text-xl font-bold text-teal-700 mb-4">
                    👨‍🎓 Thông tin học viên
                </h2>

                {isLoading ? (
                    <p>Đang tải...</p>
                ) : error ? (
                    <p className="text-red-500">Không thể tải dữ liệu.</p>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Họ tên</p>
                            <p className="font-medium">{s.name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p>{s.email}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Số điện thoại</p>
                            <p>{s.phone || "—"}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Trạng thái</p>
                            <p>{s.status}</p>
                        </div>

                        <div>
                        </div>

                        <div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetailModal;