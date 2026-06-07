// src/page/edit-exam/UploadListeningAudio.jsx
import { useState } from "react";
import axiosInstance from "@/network/httpRequest";
import { toast } from "react-toastify";
import { uploadAudioFile } from "../../utils/firebase/firebaseUtilsAudio";

function UploadListeningAudio({ examId, onUploaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (!examId) {
      const msg = "Không tìm thấy examId để upload audio.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const audioPayload = [];

      for (const file of files) {
        const url = await uploadAudioFile(
          file,
          { examId },
          (progress) => {
            // nếu muốn show progress thì handle ở đây
            console.log(file.name, progress);
          }
        );

        audioPayload.push({
          url,
          name: file.name,
        });
      }

      const res = await axiosInstance.post(
        `/exams/${examId}/listening-audios`,
        { audios: audioPayload }
      );

      setUploadedCount((prev) => prev + files.length);
      toast.success(
        res?.data?.message ||
          `Upload & lưu ${files.length} file audio thành công!`
      );

      onUploaded && onUploaded();
    } catch (err) {
      console.error("Upload audio error:", err);
      const msg =
        err?.response?.data?.message || err.message || "Upload audio thất bại";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="border border-gray-300 p-4 rounded shadow bg-white">
      <label className="font-bold text-lg block mb-2">
        Upload audio phần Nghe (MP3 / WAV / M4A):
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Gợi ý: Đặt tên file theo thứ tự phần nghe (ví dụ:
        <span className="font-mono"> hsk2_listening_part1.mp3</span>,
        <span className="font-mono"> part2_11-20.m4a</span>) để dễ quản lý.
      </p>

      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={handleChange}
        className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90 cursor-pointer"
      />

      {isUploading && (
        <p className="mt-2 text-sm text-primary">
          Đang upload audio (Firebase) & lưu vào đề thi...
        </p>
      )}

      {uploadedCount > 0 && !isUploading && (
        <p className="mt-2 text-xs text-emerald-600">
          Đã upload & lưu tổng cộng {uploadedCount} file audio trong phiên này.
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

export default UploadListeningAudio;