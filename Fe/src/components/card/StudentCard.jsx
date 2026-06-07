import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import Swal from "sweetalert2";

const StudentCard = ({
  student,
  onViewDetail,
  onViewCourses,
  onUpdateStatus, // ✅ thêm prop này
  isUpdatingStatus = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const statusColors = {
    active: "text-green-600 bg-green-100",
    pending: "text-yellow-600 bg-yellow-100",
    blocked: "text-red-600 bg-red-100",
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdateStatus?.(newStatus); // ✅ gọi callback
      handleClose();

      await Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: `Trạng thái đã được chuyển sang "${newStatus}"`,
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      handleClose();

      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại!",
        text: error?.response?.data?.message || "Vui lòng thử lại.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-xl transition-all duration-200 relative">
      {/* Menu 3 chấm */}
      <div className="absolute top-2 right-2">
        <IconButton size="small" onClick={handleMenuClick}>
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem disabled={isUpdatingStatus} onClick={() => handleStatusChange("active")}>
            Active
          </MenuItem>
          <MenuItem disabled={isUpdatingStatus} onClick={() => handleStatusChange("pending")}>
            Pending
          </MenuItem>
          <MenuItem disabled={isUpdatingStatus} onClick={() => handleStatusChange("blocked")}>
            Blocked
          </MenuItem>
        </Menu>
      </div>

      {/* Avatar + Info */}
      <div className="flex flex-col items-center">
        <img
          src={student.avatar || "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"}
          alt={student.name}
          className="w-20 h-20 rounded-full object-cover border shadow"
        />
        <h3 className="mt-3 text-lg font-semibold text-gray-800">{student.name}</h3>
        <p className="text-sm text-gray-500">{student.email}</p>
      </div>

      {/* Info */}
      <div className="text-sm text-gray-600 mt-4 space-y-1 text-center">
        <p>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[student.status]}`}>
            {student.status}
          </span>
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={onViewDetail}
          className="flex-1 bg-[#E0F3FF] text-blue-600 rounded-md py-2 text-sm font-medium hover:bg-[#c8eaff]"
        >
          Chi tiết
        </button>

        <button
          onClick={onViewCourses}
          className="flex-1 bg-[#F2F2F2] text-gray-700 rounded-md py-2 text-sm hover:bg-gray-300"
        >
          Khoá học
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
