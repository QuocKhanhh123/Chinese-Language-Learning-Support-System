import { useState } from "react";
import { toast } from "react-toastify";
import { useTeachers } from "../../hooks/useTeacher";
import { useCreateClass } from "../../hooks/useClasses";

const DAY_OPTIONS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 0, label: "CN" },
];

const defaultForm = {
  name: "",
  startTime: "08:00",
  endTime: "10:00",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  maxStudents: 20,
};

export default function CreateClassModal({ opened, onClose, courseId }) {
  const { data: teachers = [] } = useTeachers("teacher");
  const createClass = useCreateClass();

  const [form, setForm] = useState(defaultForm);
  const [selectedDays, setSelectedDays] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

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
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên lớp"); return; }
    if (!form.startDate || !form.endDate || !form.registrationDeadline) {
      toast.error("Vui lòng điền đầy đủ các ngày"); return;
    }

    const schedule = selectedDays.map((day) => ({
      dayOfWeek: day,
      startTime: form.startTime,
      endTime: form.endTime,
    }));

    try {
      await createClass.mutateAsync({
        name:                 form.name,
        course:               courseId,
        teacher:              teacherId,
        schedule,
        startDate:            new Date(form.startDate).toISOString(),
        endDate:              new Date(form.endDate).toISOString(),
        registrationDeadline: new Date(form.registrationDeadline).toISOString(),
        maxStudents:          parseInt(form.maxStudents) || 20,
      });
      toast.success("🎉 Tạo lớp học thành công!");
      setForm(defaultForm);
      setSelectedDays([]);
      setTeacherId("");
      setTeacherSearch("");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Tạo lớp thất bại");
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
          background: "linear-gradient(135deg,#7f1d1d,#b91c1c)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24 }}>🏫</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Tạo lớp học mới</h2>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Điền đầy đủ thông tin lớp</p>
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
          <form id="create-class-form" onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Class name */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  Tên lớp <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleField("name", e.target.value)}
                  placeholder="VD: Lớp HSK1 Sáng — Thứ 2, 4, 6"
                  required
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1a1a1a",
                    outline: "none", boxSizing: "border-box", fontFamily: "inherit"
                  }}
                  onFocus={e => e.target.style.borderColor = "#dc2626"}
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
                  {filteredTeachers.length === 0 ? (
                    <div style={{ padding: "10px 14px", color: "#9ca3af", fontSize: 13 }}>
                      Không tìm thấy giáo viên
                    </div>
                  ) : (
                    filteredTeachers.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => { setTeacherId(t._id); setTeacherSearch(t.name); }}
                        style={{
                          padding: "10px 14px", cursor: "pointer", fontSize: 13,
                          background: teacherId === t._id ? "rgba(185,28,28,0.06)" : "#fff",
                          color: teacherId === t._id ? "#b91c1c" : "#374151",
                          fontWeight: teacherId === t._id ? 700 : 400,
                          borderBottom: "1px solid #f9fafb",
                          transition: "background 0.15s"
                        }}
                        onMouseEnter={e => { if (teacherId !== t._id) e.currentTarget.style.background = "#f9fafb"; }}
                        onMouseLeave={e => { if (teacherId !== t._id) e.currentTarget.style.background = "#fff"; }}
                      >
                        {t.name} <span style={{ color: "#9ca3af" }}>({t.email})</span>
                        {teacherId === t._id && <span style={{ float: "right" }}>✓</span>}
                      </div>
                    ))
                  )}
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
                        cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s",
                        background: selectedDays.includes(d.value) ? "#dc2626" : "#fff",
                        borderColor: selectedDays.includes(d.value) ? "#dc2626" : "#e5e7eb",
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
                {[
                  { label: "Giờ bắt đầu *", field: "startTime", type: "time" },
                  { label: "Giờ kết thúc *", field: "endTime", type: "time" },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(e) => handleField(field, e.target.value)}
                      required
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
                {[
                  { label: "Ngày khai giảng *", field: "startDate" },
                  { label: "Ngày kết thúc *", field: "endDate" },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                      {label}
                    </label>
                    <input
                      type="date"
                      value={form[field]}
                      onChange={(e) => handleField(field, e.target.value)}
                      required
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 11,
                        border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                        boxSizing: "border-box", fontFamily: "inherit", color: "#1a1a1a"
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Registration deadline */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                  Hạn đăng ký <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="date"
                  value={form.registrationDeadline}
                  onChange={(e) => handleField("registrationDeadline", e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                    boxSizing: "border-box", fontFamily: "inherit", color: "#1a1a1a"
                  }}
                />
              </div>

              {/* Max students */}
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
            form="create-class-form"
            disabled={createClass.isPending}
            style={{
              flex: 2, padding: "12px 0", borderRadius: 12, border: "none",
              background: createClass.isPending ? "#e5e7eb" : "linear-gradient(135deg,#b91c1c,#dc2626)",
              color: createClass.isPending ? "#9ca3af" : "#fff",
              fontWeight: 800, fontSize: 14, cursor: createClass.isPending ? "wait" : "pointer",
              boxShadow: createClass.isPending ? "none" : "0 4px 16px rgba(185,28,28,0.3)"
            }}
          >
            {createClass.isPending ? "⏳ Đang tạo..." : "🏫 Tạo lớp học"}
          </button>
        </div>
      </div>
    </div>
  );
}
