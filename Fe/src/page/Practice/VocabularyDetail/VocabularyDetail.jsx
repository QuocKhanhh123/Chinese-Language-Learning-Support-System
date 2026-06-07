// src/pages/practice/vocabulary/VocabularyDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import {
  ArrowBack,
  CheckCircleOutline,
  ErrorOutline,
} from "@mui/icons-material";
import axiosInstance from "@/network/httpRequest";
import annyang from "annyang";

const VocabularyDetailStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vocab, setVocab] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [details, setDetails] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [bandLabel, setBandLabel] = useState("");
  const [band, setBand] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [analyzeError, setAnalyzeError] = useState("");

  const bandColorMap = {
    chua_dat: "#ef4444",
    dat_co_ban: "#f59e0b",
    kha: "#3b82f6",
    tot: "#16a34a",
  };

  /* ================= FETCH VOCAB ================= */
  useEffect(() => {
    const fetchVocabulary = async () => {
      const res = await axiosInstance.get(`/vocabularies/details/${id}`);
      setVocab(res.data.data);
    };
    if (id) fetchVocabulary();
  }, [id]);

  /* ================= ANNYANG ================= */
  useEffect(() => {
    if (!annyang || !isRecording) {
      annyang?.abort();
      return;
    }

    annyang.setLanguage("zh-CN");

    const handleResult = (userSaid) => {
      if (Array.isArray(userSaid) && userSaid[0]) {
        setTranscript(userSaid[0]);
      }
    };

    annyang.addCallback("result", handleResult);
    annyang.start();

    return () => {
      annyang.removeCallback("result", handleResult);
      annyang.abort();
    };
  }, [isRecording]);

  /* ================= RECORD ================= */
  const startRecording = async () => {
    setSnackbarMessage("");
    setAnalyzeError("");
    setDetails([]);
    setTranscript("");
    setAccuracy(null);
    setBandLabel("");
    setBand("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        analyzeWord(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      setAnalyzeError(
        "Khong the truy cap microphone. Vui long cap quyen mic cho trinh duyet."
      );
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  /* ================= ANALYZE ================= */
  const analyzeWord = async (blob) => {
    if (!blob || !vocab) return;

    try {
      setIsAnalyzing(true);
      setAnalyzeError("");

      const formData = new FormData();
      formData.append("audio", blob, "audio.webm");
      formData.append("target_text", vocab.chinese);
      formData.append("vocabularyId", id);

      const res = await axiosInstance.post(
        "/vocabularies/pronunciation/evaluate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = res.data?.data || {};
      setTranscript(data.asr_text || "");
      setAccuracy(
        typeof data.score === "number" ? data.score : Number(data.score || 0)
      );
      setBandLabel(data.bandLabel || "");
      setBand(data.band || "");
      setDetails(Array.isArray(data.details) ? data.details : []);

      if (data.band === "tot") {
        setSnackbarMessage("Phat am rat tot! Tiep tuc phat huy nhe.");
      } else if (data.band === "kha") {
        setSnackbarMessage("Phat am kha on. Co the cai thien them de tro nen tu nhien hon.");
      } else if (data.band === "dat_co_ban") {
        setSnackbarMessage("Ban da dat co ban. Hay luyen them de dat do chinh xac cao hon.");
      } else {
        setSnackbarMessage("Phat am chua dat. Xem goi y ben duoi va thu lai.");
      }
    } catch (error) {
      setAnalyzeError(
        error?.response?.data?.message ||
        "Khong cham duoc phat am luc nay. Vui long thu lai sau."
      );
      setSnackbarMessage("");
      setDetails([]);
      setBandLabel("");
      setBand("");
      setAccuracy(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ================= TTS ================= */
  const speakChinese = () => {
    const utterance = new SpeechSynthesisUtterance(vocab.chinese);
    utterance.lang = "zh-CN";
    speechSynthesis.speak(utterance);
  };

  if (!vocab) {
    return (
      <Box mt={6} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", py: 3 }}>
      {/* BACK */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/practice/vocabulary")}
        sx={{ mb: 3, textTransform: "none" }}
      >
        Quay lại danh sách
      </Button>

      {/* ================= VOCAB CORE ================= */}
      <Paper sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
        <Typography fontSize={64} fontWeight={800}>
          {vocab.chinese}
        </Typography>

        <Typography color="error" fontSize={22} fontWeight={600} mt={1}>
          {vocab.pinyin}
        </Typography>

        <Typography mt={2} color="text.secondary">
          {vocab.vietnamese}
        </Typography>

        <Button
          variant="outlined"
          startIcon={<VolumeUpIcon />}
          sx={{ mt: 3, borderRadius: 999 }}
          onClick={speakChinese}
        >
          Nghe phát âm mẫu
        </Button>
      </Paper>

      {/* ================= PRACTICE ================= */}
      <Paper sx={{ mt: 4, p: 4, borderRadius: 4 }}>
        <Typography fontWeight={700} mb={1}>
          🎤 Luyện phát âm
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nhấn nút bên dưới và đọc to từ này bằng tiếng Trung.
        </Typography>

        {isAnalyzing ? (
          <Box mt={3} display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>Đang phân tích phát âm…</Typography>
          </Box>
        ) : (
          <Button
            fullWidth
            sx={{ mt: 3, borderRadius: 999, py: 1.2 }}
            variant="contained"
            color={isRecording ? "error" : "primary"}
            startIcon={isRecording ? <StopIcon /> : <MicIcon />}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
          </Button>
        )}

        {transcript && (
          <Typography mt={2}>
            🔊 Hệ thống nghe được: <b>{transcript}</b>
          </Typography>
        )}

        {accuracy !== null && (
          <Box mt={1.5}>
            <Typography fontWeight={700} color="success.main">
              🎯 Độ chính xác: {accuracy}%
            </Typography>
            {bandLabel && (
              <Box
                sx={{
                  mt: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  backgroundColor: bandColorMap[band] || "#475569",
                }}
              >
                Muc danh gia: {bandLabel}
              </Box>
            )}
          </Box>
        )}

        {analyzeError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {analyzeError}
          </Alert>
        )}
      </Paper>

      {/* ================= RESULT ================= */}
      {snackbarMessage && (
        <Paper
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            bgcolor: "#f0fdf4",
            border: "1px solid #bbf7d0",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleOutline color="success" />
            <Typography fontWeight={700}>Kết quả phân tích</Typography>
          </Box>
          <Typography mt={1}>{snackbarMessage}</Typography>
        </Paper>
      )}

      {/* ================= ERROR DETAILS ================= */}
      {details.length > 0 && (
        <Box mt={4}>
          <Typography fontWeight={700} mb={1}>
            📌 Gợi ý sửa phát âm
          </Typography>

          {details.map((d, i) => (
            <Paper
              key={i}
              sx={{
                p: 2,
                mb: 1.5,
                borderLeft: "4px solid #ef4444",
              }}
            >
              <Typography fontWeight={700}>
                <ErrorOutline sx={{ mr: 1 }} color="error" />
                {d.char}
              </Typography>
              <Typography>
                Bạn đọc: <b>{d.spoken || "—"}</b>
              </Typography>
              <Typography>
                Đúng là: <b>{d.expected}</b>
              </Typography>
              <Typography color="error">👉 {d.suggestion}</Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default VocabularyDetailStudent;
