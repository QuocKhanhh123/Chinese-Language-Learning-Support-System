import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import axiosInstance from "@/network/httpRequest";

function buildCharCompare(target = "", spoken = "") {
    const targetChars = [...String(target)];
    const spokenChars = [...String(spoken)];
    const max = Math.max(targetChars.length, spokenChars.length);
    const rows = [];
    for (let i = 0; i < max; i += 1) {
        const expected = targetChars[i] || "";
        const actual = spokenChars[i] || "";
        const ok = expected === actual && expected !== "";
        rows.push({ index: i, expected, actual, ok });
    }
    return rows;
}

function Voice() {
    const [targetText, setTargetText] = useState("");
    const [transcript, setTranscript] = useState("");
    const [score, setScore] = useState(null);
    const [band, setBand] = useState("");
    const [bandLabel, setBandLabel] = useState("");
    const [details, setDetails] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const bandColor = useMemo(() => {
        const colorMap = {
            chua_dat: "#ef4444",
            dat_co_ban: "#f59e0b",
            kha: "#3b82f6",
            tot: "#16a34a",
        };
        return colorMap[band] || "#64748b";
    }, [band]);

    const startRecording = async () => {
        if (!targetText.trim()) {
            setErrorText("Vui lòng nhập câu mục tiêu để chấm phát âm.");
            return;
        }

        setErrorText("");
        setDetails([]);
        setTranscript("");
        setScore(null);
        setBand("");
        setBandLabel("");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (event) => chunks.push(event.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                analyzePronunciation(blob);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (error) {
            setErrorText(
                "Không thể truy cập microphone. Vui lòng cấp quyền microphone cho trình duyệt."
            );
        }
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        setIsRecording(false);
    };

    const analyzePronunciation = async (audioBlob) => {
        setIsAnalyzing(true);
        setErrorText("");

        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "voice-practice.webm");
            formData.append("target_text", targetText.trim());

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
            setScore(typeof data.score === "number" ? data.score : Number(data.score));
            setBand(data.band || "");
            setBandLabel(data.bandLabel || "");
            setDetails(Array.isArray(data.details) ? data.details : []);
        } catch (error) {
            setErrorText(
                error?.response?.data?.message ||
                "Chấm phát âm thất bại. Vui lòng thử lại sau."
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    const compareRows = useMemo(() => {
        if (!targetText.trim() || !transcript.trim()) return [];
        return buildCharCompare(targetText.trim(), transcript.trim());
    }, [targetText, transcript]);

    const scoreColor = bandColor;
    const scoreLabel = score !== null && !Number.isNaN(score) ? `${score}%` : "--";

    return (
        <Box sx={{ maxWidth: 880, mx: "auto", py: 3 }}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography fontSize={28} fontWeight={800}>
                    Luyện chấm phát âm bằng Whisper
                </Typography>
                <Typography mt={1} color="text.secondary">
                    Nhập câu tiếng Trung, bấm ghi âm, sau đó hệ thống sẽ chấm điểm dựa trên độ chính xác câu mà Whisper nhận dạng được.
                </Typography>

                <TextField
                    fullWidth
                    label="Câu mục tiêu"
                    value={targetText}
                    onChange={(event) => setTargetText(event.target.value)}
                    sx={{ mt: 3 }}
                    placeholder="Ví dụ: 你好，我是学生。"
                />

                {isAnalyzing ? (
                    <Box mt={3} display="flex" alignItems="center" gap={2}>
                        <CircularProgress size={24} />
                        <Typography>Đang phân tích phát âm...</Typography>
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

                {errorText && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {errorText}
                    </Alert>
                )}

                {(transcript || (score !== null && !Number.isNaN(score))) && (
                    <Box mt={3}>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                            <Paper
                                variant="outlined"
                                sx={{ flex: 1, p: 2.5, borderRadius: 3, borderColor: "rgba(148,163,184,0.35)" }}
                            >
                                <Typography fontWeight={800} mb={1}>
                                    Kết quả
                                </Typography>

                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ position: "relative", width: 84, height: 84 }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={100}
                                            sx={{ position: "absolute", color: "rgba(148,163,184,0.25)" }}
                                            size={84}
                                        />
                                        <CircularProgress
                                            variant="determinate"
                                            value={typeof score === "number" ? score : 0}
                                            sx={{ position: "absolute", color: scoreColor }}
                                            size={84}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                inset: 0,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography fontWeight={900} fontSize={16} sx={{ color: scoreColor }}>
                                                {scoreLabel}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontWeight={800} fontSize={16}>
                                            Độ chính xác
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={typeof score === "number" ? score : 0}
                                            sx={{
                                                mt: 1,
                                                height: 10,
                                                borderRadius: 999,
                                                backgroundColor: "rgba(148,163,184,0.25)",
                                                "& .MuiLinearProgress-bar": { borderRadius: 999, backgroundColor: scoreColor },
                                            }}
                                        />
                                        <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap>
                                            <Chip
                                                label={bandLabel ? `Mức đánh giá: ${bandLabel}` : "Mức đánh giá: --"}
                                                sx={{
                                                    fontWeight: 800,
                                                    color: "#fff",
                                                    backgroundColor: scoreColor,
                                                }}
                                                size="small"
                                            />
                                            {transcript ? (
                                                <Chip
                                                    label={`Whisper nghe được: ${transcript}`}
                                                    sx={{ maxWidth: "100%", fontWeight: 700 }}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : null}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper
                                variant="outlined"
                                sx={{ flex: 1, p: 2.5, borderRadius: 3, borderColor: "rgba(148,163,184,0.35)" }}
                            >
                                <Typography fontWeight={800} mb={1}>
                                    So sánh trực quan
                                </Typography>
                                <Typography color="text.secondary" fontSize={13} mb={1.5}>
                                    Mỗi ký tự được tô màu: <b style={{ color: "#16a34a" }}>đúng</b> /{" "}
                                    <b style={{ color: "#ef4444" }}>sai</b>.
                                </Typography>

                                {!compareRows.length ? (
                                    <Typography color="text.secondary">
                                        Hãy ghi âm để xem phần so sánh.
                                    </Typography>
                                ) : (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 0.75,
                                            p: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: "rgba(241,245,249,0.7)",
                                        }}
                                    >
                                        {compareRows.map((r) => (
                                            <Box
                                                key={r.index}
                                                sx={{
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 999,
                                                    fontWeight: 900,
                                                    fontSize: 14,
                                                    border: "1px solid",
                                                    borderColor: r.ok ? "rgba(22,163,74,0.35)" : "rgba(239,68,68,0.35)",
                                                    backgroundColor: r.ok ? "rgba(22,163,74,0.10)" : "rgba(239,68,68,0.10)",
                                                    color: r.ok ? "#166534" : "#991b1b",
                                                    minWidth: 34,
                                                    textAlign: "center",
                                                }}
                                                title={`Bạn đọc: ${r.actual || "-"} • Đúng là: ${r.expected || "-"}`}
                                            >
                                                {r.expected || r.actual || "•"}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Paper>
                        </Stack>
                    </Box>
                )}

            </Paper>

            {details.length > 0 && (
                <Box mt={3}>
                    <Typography fontWeight={800} mb={1.5}>
                        Gợi ý cải thiện
                    </Typography>
                    {details.map((item, index) => (
                        <Paper
                            key={`${item.char}-${index}`}
                            sx={{
                                p: 2.25,
                                mb: 1.5,
                                borderLeft: `4px solid ${bandColor}`,
                                borderRadius: 3,
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
                                <Chip
                                    label={`Ký tự: ${item.char}`}
                                    size="small"
                                    sx={{ fontWeight: 900 }}
                                    variant="outlined"
                                />
                                <Typography color="text.secondary" fontSize={12}>
                                    Vị trí: {typeof item.index === "number" ? item.index + 1 : "-"}
                                </Typography>
                            </Stack>
                            <Typography>
                                <b>Bạn đọc</b>: {item.spoken || "—"} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Đúng là</b>:{" "}
                                {item.expected || "—"}
                            </Typography>
                            <Typography sx={{ mt: 0.5, color: "#b91c1c", fontWeight: 700 }}>
                                {item.suggestion}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default Voice;