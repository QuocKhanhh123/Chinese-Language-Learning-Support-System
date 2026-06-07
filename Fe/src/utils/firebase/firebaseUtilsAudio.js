// src/utils/firebase/firebaseUtilsAudio.js
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase"; // chỉnh path cho đúng với project của anh

// Nếu muốn path đẹp, có thể tái dùng slug như bên image, tạm làm đơn giản:
const buildQuestionAudioPath = ({ examId = "unknown-exam", fileName }) => {
  const ts = Date.now();
  return `exams/${examId}/listening/${ts}-${fileName}`;
};

export const uploadAudioFile = (file, meta = {}, onProgress) => {
  const path = buildQuestionAudioPath({
    ...meta,
    fileName: file.name,
  });

  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(progress);
        }
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
};
