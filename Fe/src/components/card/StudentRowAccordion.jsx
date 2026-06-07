import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

const statusMeta = {
  active: {
    label: "Hoạt động",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Chờ kích hoạt",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  blocked: {
    label: "Không hoạt động",
    pill: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export default function StudentRow({
  student,
  onViewDetail,
  onViewCourses,
  onUpdateStatus,
  onDelete,
  isUpdatingStatus = false,
  isDeleting = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const currentStatus = student?.status || "pending";
  const meta = useMemo(
    () => statusMeta[currentStatus] || statusMeta.pending,
    [currentStatus]
  );

  const avatarFallback =
    "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";

  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdateStatus?.(newStatus);
      handleClose();

      await Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: `Trạng thái đã chuyển sang "${newStatus}"`,
        timer: 900,
        showConfirmButton: false,
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

  const handleDelete = async () => {
    const r = await Swal.fire({
      icon: "warning",
      title: "Xoá học viên?",
      text: "Hành động này không thể hoàn tác.",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626",
    });
    if (!r.isConfirmed) return;

    try {
      await onDelete?.(student?.id || student?._id);
      Swal.fire({
        icon: "success",
        title: "Đã xoá",
        timer: 900,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Lỗi xoá:", error);
      Swal.fire({
        icon: "error",
        title: "Xoá thất bại!",
        text: error?.response?.data?.message || "Vui lòng thử lại.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white/90 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-4">
        {/* Avatar */}
        <img
          src={student?.avatar || avatarFallback}
          alt={student?.name || "student"}
          className="h-11 w-11 rounded-full object-cover border border-slate-200"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = avatarFallback;
          }}
        />

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="font-extrabold text-slate-900 truncate">
              {student?.name || "—"}
            </div>

            <span
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap",
                meta.pill
              )}
              title={currentStatus}
            >
              {meta.label}
            </span>

            {student?.hasPaid ? (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap bg-sky-50 text-sky-700 border-sky-200"
                title="Học viên đã thanh toán/ghi danh ít nhất 1 khóa học"
              >
                Đã thanh toán
              </span>
            ) : null}
          </div>

          <div className="mt-0.5 text-xs text-slate-600 truncate">
            {student?.email || "—"}
            {student?.phone ? ` • ${student.phone}` : ""}
          </div>
        </div>

       

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewDetail}
            className="hidden sm:inline-flex rounded-xl px-3 py-2 text-sm font-extrabold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          >
            Chi tiết
          </button>

          <button
            type="button"
            onClick={onViewCourses}
            className="hidden sm:inline-flex rounded-xl px-3 py-2 text-sm font-extrabold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          >
            Khoá học
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-extrabold bg-rose-600 text-white hover:bg-rose-700",
              isDeleting && "opacity-60 cursor-not-allowed"
            )}
            title="Xoá"
          >
            <DeleteOutlineIcon fontSize="small" />
            {isDeleting ? "..." : "Xoá"}
          </button>

          {/* Menu status */}
          <IconButton
            size="small"
            onClick={handleMenuClick}
            disabled={isUpdatingStatus}
            title="Đổi trạng thái"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleClose}>
            <MenuItem
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange("active")}
            >
              Hoạt động
            </MenuItem>
            <MenuItem
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange("pending")}
            >
              Chờ kích hoạt
            </MenuItem>
            <MenuItem
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange("blocked")}
            >
              Không hoạt động 
            </MenuItem>
          </Menu>
        </div>
      </div>

      {/* Mobile actions row */}
      <div className="sm:hidden px-4 pb-3 flex gap-2">
        <button
          type="button"
          onClick={onViewDetail}
          className="flex-1 rounded-xl px-3 py-2 text-sm font-extrabold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        >
          Chi tiết
        </button>
        <button
          type="button"
          onClick={onViewCourses}
          className="flex-1 rounded-xl px-3 py-2 text-sm font-extrabold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        >
          Khoá học
        </button>
      </div>
    </div>
  );
}
