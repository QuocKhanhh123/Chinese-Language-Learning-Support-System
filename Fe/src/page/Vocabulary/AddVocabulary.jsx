import axiosInstance from "@/network/httpRequest";
import { Add, ArrowBack, UploadFile } from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

function AddVocabulary() {
  const navigate = useNavigate();
  const [audioFile, setAudioFile] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const stripEmpty = (obj) =>
    Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
        .filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      chinese: "",
      pinyin: "",
      vietnamese: "",
      exampleCn: "",
      examplePy: "",
      exampleVi: "",
      note: "",
      level: "",
      wordType: "",
      courseId: "",
      lessonId: "",
    },
    mode: "onSubmit",
  });

  const toPublicUrl = (url) => {
    if (!url) return url;
    if (/^https?:\/\//.test(url)) return url;
    const apiOrigin = new URL(axiosInstance.defaults.baseURL).origin;
    return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const uploadAudioFile = async () => {
    if (!audioFile) return undefined;

    const formData = new FormData();
    formData.append("audio", audioFile);

    setUploadingAudio(true);
    try {
      const res = await axiosInstance.post("/upload/upload-audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return toPublicUrl(res?.data?.data?.url);
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleAudioChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAudioFile(null);
      return;
    }

    const isMp3 =
      file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3");

    if (!isMp3) {
      event.target.value = "";
      setAudioFile(null);
      toast.error("Vui lòng chọn file MP3.");
      return;
    }

    setAudioFile(file);
  };

  const onSubmit = async (data) => {
    try {
      const { exampleCn, examplePy, exampleVi, ...rest } = data;
      const cleaned = stripEmpty(rest);

      const hasExample = [exampleCn, examplePy, exampleVi].some(
        (v) => v && v.trim() !== ""
      );

      if (hasExample) {
        cleaned.example = stripEmpty({
          chinese: exampleCn,
          pinyin: examplePy,
          vietnamese: exampleVi,
        });
      }

      const uploadedAudioUrl = await uploadAudioFile();
      if (uploadedAudioUrl) {
        cleaned.audioUrl = uploadedAudioUrl;
      }

      const res = await axiosInstance.post("/vocabularies/create", cleaned);
      if (res.status === 200 || res.status === 201) {
        toast.success("Thêm từ vựng thành công!");
        reset();
        setAudioFile(null);
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (error) {
      console.group("Lỗi thêm từ vựng");
      console.log("payload gửi (debug):", error?.config?.data);
      console.log("status:", error?.response?.status);
      console.log("data:", error?.response?.data);
      console.groupEnd();

      const msg =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : "") ||
        "Thêm từ vựng thất bại!";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <ToastContainer hideProgressBar autoClose={3000} />

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full border p-2 shadow hover:bg-gray-100 transition"
        >
          <ArrowBack />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Thêm từ vựng mới</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Từ tiếng Trung (Chinese)
          </label>
          <input
            {...register("chinese", {
              required: "Vui lòng nhập từ tiếng Trung.",
              validate: (v) =>
                /[\u4e00-\u9fff]/.test(v) || "Vui lòng nhập chữ Hán hợp lệ",
            })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
            placeholder="Ví dụ: 爱"
          />
          {errors.chinese && (
            <p className="text-sm text-red-500 mt-1">
              {errors.chinese.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phiên âm (Pinyin)
          </label>
          <input
            {...register("pinyin", {
              required: "Vui lòng nhập pinyin.",
              validate: (v) =>
                /^[a-zA-ZāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüÜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛ\s]+(?:[1-5])?$/.test(
                  v
                ) || "Pinyin không hợp lệ",
            })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
            placeholder="Ví dụ: ài hoặc ai4"
          />
          {errors.pinyin && (
            <p className="text-sm text-red-500 mt-1">{errors.pinyin.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nghĩa tiếng Việt
          </label>
          <input
            {...register("vietnamese", {
              required: "Vui lòng nhập nghĩa tiếng Việt.",
            })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
            placeholder="Ví dụ: Yêu"
          />
          {errors.vietnamese && (
            <p className="text-sm text-red-500 mt-1">
              {errors.vietnamese.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ví dụ (Example)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              {...register("exampleCn")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              placeholder="Ví dụ (CN): 我爱你。"
            />
            <input
              {...register("examplePy")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              placeholder="Ví dụ (PY): Wǒ ài nǐ."
            />
            <input
              {...register("exampleVi")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              placeholder="Ví dụ (VI): Tôi yêu bạn."
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Nếu để trống cả 3 ô, field <code>example</code> sẽ không được gửi.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú (Note)
          </label>
          <textarea
            {...register("note", {
              setValueAs: (v) => (v?.trim() ? v.trim() : undefined),
            })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
            rows={2}
            placeholder="Ghi chú hoặc chú thích cho từ này..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File audio MP3 (Tùy chọn)
          </label>
          <label className="flex items-center justify-between gap-3 w-full px-4 py-3 border border-dashed rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition">
            <span className="min-w-0 text-gray-600 truncate">
              {audioFile ? audioFile.name : "Chọn file .mp3 từ máy"}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500 text-white text-sm font-semibold">
              <UploadFile fontSize="small" /> Tải lên
            </span>
            <input
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={handleAudioChange}
              className="hidden"
            />
          </label>
          {audioFile && (
            <p className="text-xs text-gray-500 mt-1">
              File sẽ được tải lên khi bạn bấm lưu từ vựng.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course ID (Tùy chọn)
            </label>
            <input
              {...register("courseId", {
                setValueAs: (v) => (v?.trim() ? v.trim() : undefined),
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              placeholder="Nhập ID khóa học nếu có"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson ID (Tùy chọn)
            </label>
            <input
              {...register("lessonId", {
                setValueAs: (v) => (v?.trim() ? v.trim() : undefined),
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              placeholder="Nhập ID bài học nếu có"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cấp độ (Level)
            </label>
            <select
              {...register("level", { setValueAs: (v) => (v ? v : undefined) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
            >
              <option value="">Chọn cấp độ</option>
              <option value="HSK1">HSK1</option>
              <option value="HSK2">HSK2</option>
              <option value="HSK3">HSK3</option>
              <option value="HSK4">HSK4</option>
              <option value="HSK5">HSK5</option>
              <option value="HSK6">HSK6</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại từ (Word Type)
            </label>
            <select
              {...register("wordType", {
                setValueAs: (v) => (v ? v : undefined),
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
            >
              <option value="">Chọn loại từ</option>
              <option value="noun">Danh từ</option>
              <option value="verb">Động từ</option>
              <option value="adjective">Tính từ</option>
              <option value="adverb">Trạng từ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={uploadingAudio}
            className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Add /> {uploadingAudio ? "Đang tải audio..." : "Lưu từ vựng"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddVocabulary;
