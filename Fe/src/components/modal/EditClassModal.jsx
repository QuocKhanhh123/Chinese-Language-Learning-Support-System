import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTeachers } from "../../hooks/useTeacher";
import { useUpdateClass } from "../../hooks/useClasses";

const DAY_OPTIONS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 0, label: "CN" },
];

function toDateInput(dateStr) {
  if (!dateStr) return "";
  try { return new Date(dateStr).toISOString().split("T")[0]; } catch { return ""; }
}

export default function EditClassModal({ opened, onClose, cls }) {
  const { data: teachers = [] } = useTeachers("teacher");
  const updateClass = useUpdateClass();

  const [form, setForm] = useState({
    name: "",
    startTime: "08:00",
    endTime: "10:00",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    maxStudents: 20,
  });
  const [selectedDays, setSelectedDays] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  // Init from cls
  useEffect(() => {
    if (cls && opened) {
      const firstSlot = cls.schedule?.[0];
      setForm({
        name: cls.name || "",
        startTime: firstSlot?.startTime || "08:00",
        endTime: firstSlot?.endTime || "10:00",
        startDate: toDateInput(cls.startDate),
        endDate: toDateInput(cls.endDate),
        registrationDeadline: toDateInput(cls.registrationDeadline),
        maxStudents: cls.maxStudents || 20,
      });
      setSelectedDays(cls.schedule?.map((s) => s.dayOfWeek) || []);
      setTeacherId(cls.teacher?._id || cls.teacher || "");
      const teacherName = typeof cls.teacher === "object" ? cls.teacher?.name : "";
      setTeacherSearch(teacherName);
    }
  }, [cls, opened]);

  const filteredTeachers = teacherSearch.trim()
    ? teachers.filter((t) =>
        t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(teacherSearch.toLowerCase())
      )
    : teachers;

  const handleField = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleDay = (val) =>
    setSelectedDays((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) { toast.error("Vui lòng chọn giáo viên"); return; }
    if (selectedDays.length === 0) { toast.error("Vui lòng chọn ít nhất 1 ngày học"); return; }

    const schedule = selectedDays.map((day) => ({
      dayOfWeek: day,
      startTime: form.startTime,
      endTime: form.endTime,
    }));

    try {
      await updateClass.mutateAsync({
        classId: cls._id,
        data: {
          name:                 form.name,
          teacher:              teacherId,
          schedule,
          startDate:            new Date(form.startDate).toISOString(),
          endDate:              new Date(form.endDate).toISOString(),
          registrationDeadline: new Date(form.registrationDeadline).toISOString(),
          maxStudents:          parseInt(form.maxStudents) || 20,
        },
      });
      toast.success("✅ Cập nhật lớp học thành công!");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  if (!opened) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px",
          background: "linear-gradient(135deg,#1e3a5f,#2563eb)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24 }}>✏️</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Chỉnh sửa lớp học</h2>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>{cls?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: "none",
              background: "rgba(255,255,255,0.2)", color: "#fff",
              fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <form id="edit-class-form" onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Class name */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  Tên lớp <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleField("name", e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit", color: "#1a1a1a"
                  }}
                  onFocus={e => e.target.style.borderColor = "#2563eb"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              {/* Teacher */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  Giáo viên phụ trách <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc email..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "11px 11px 0 0",
                    border: "1.5px solid #e5e7eb", borderBottom: "1px solid #f3f4f6",
                    fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit"
                  }}
                />
                <div style={{
                  border: "1.5px solid #e5e7eb", borderTop: "none",
                  borderRadius: "0 0 11px 11px", maxHeight: 160, overflowY: "auto"
                }}>
                  {filteredTeachers.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => { setTeacherId(t._id); setTeacherSearch(t.name); }}
                      style={{
                        padding: "10px 14px", cursor: "pointer", fontSize: 13,
                        background: teacherId === t._id ? "rgba(37,99,235,0.06)" : "#fff",
                        color: teacherId === t._id ? "#2563eb" : "#374151",
                        fontWeight: teacherId === t._id ? 700 : 400,
                        borderBottom: "1px solid #f9fafb"
                      }}
                    >
                      {t.name} <span style={{ color: "#9ca3af" }}>({t.email})</span>
                      {teacherId === t._id && <span style={{ float: "right" }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Days */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>
                  Ngày học trong tuần <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DAY_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      style={{
                        padding: "7px 16px", borderRadius: 999, border: "1.5px solid",
                        cursor: "pointer", fontWeight: 700, fontSize: 13,
                        background: selectedDays.includes(d.value) ? "#2563eb" : "#fff",
                        borderColor: selectedDays.includes(d.value) ? "#2563eb" : "#e5e7eb",
                        color: selectedDays.includes(d.value) ? "#fff" : "#6b7280"
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Giờ bắt đầu", "startTime"], ["Giờ kết thúc", "endTime"]].map(([label, field]) => (
                  <div key={field}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                      {label}
                    </label>
                    <input
                      type="time"
                      value={form[field]}
                      onChange={(e) => handleField(field, e.target.value)}
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 11,
                        border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                        boxSizing: "border-box", fontFamily: "inherit", color: "#1a1a1a"
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Ngày khai giảng", "startDate"], ["Ngày kết thúc", "endDate"]].map(([label, field]) => (
                  <div key={field}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                      {label}
                    </label>
                    <input
                      type="date"
                      value={form[field]}
                      onChange={(e) => handleField(field, e.target.value)}
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 11,
                        border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                        boxSizing: "border-box", fontFamily: "inherit", color: "#1a1a1a"
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  Hạn đăng ký
                </label>
                <input
                  type="date"
                  value={form.registrationDeadline}
                  onChange={(e) => handleField("registrationDeadline", e.target.value)}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit", color: "#1a1a1a"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  Số học viên tối đa
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={form.maxStudents}
                  onChange={(e) => handleField("maxStudents", e.target.value)}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit", color: "#1a1a1a"
                  }}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px", borderTop: "1px solid #f3f4f6",
          display: "flex", gap: 12
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 12, border: "1.5px solid #e5e7eb",
              background: "#fff", color: "#6b7280", fontWeight: 700, fontSize: 14, cursor: "pointer"
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="edit-class-form"
            disabled={updateClass.isPending}
            style={{
              flex: 2, padding: "12px 0", borderRadius: 12, border: "none",
              background: updateClass.isPending ? "#e5e7eb" : "linear-gradient(135deg,#1e3a5f,#2563eb)",
              color: updateClass.isPending ? "#9ca3af" : "#fff",
              fontWeight: 800, fontSize: 14, cursor: updateClass.isPending ? "wait" : "pointer",
              boxShadow: updateClass.isPending ? "none" : "0 4px 16px rgba(37,99,235,0.3)"
            }}
          >
            {updateClass.isPending ? "⏳ Đang lưu..." : "💾 Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
