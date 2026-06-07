// 📁 src/components/practice/renshuu/RenshuuPractice.jsx
import { useState } from 'react'
import {
    Button,
    Typography,
    Paper,
    Box,
    Chip,
    Snackbar,
    Alert,
    Divider,
    Grid,
    Card,
    CardContent,
    LinearProgress,
} from '@mui/material'
import RenshuuQuestionCard from './RenshuuQuestionCard'
import axiosInstance from '@/network/httpRequest'

export default function RenshuuPractice({
    questions,
    lessonTitle,
    answers,
    onSelect,
    onBack,
    renshuuId,
}) {
    const [result, setResult] = useState(null)
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success',
    })

    const handleSubmit = async () => {
        const hasAnsweredAll = questions.every((q) => answers[q._id])
        if (!hasAnsweredAll) {
            setToast({
                open: true,
                message: ' Vui lòng chọn đáp án cho tất cả các câu hỏi.',
                severity: 'warning',
            })
            return
        }

        try {
            const formattedAnswers = Object.entries(answers).map(
                ([questionId, selectedAnswer]) => ({
                    questionId,
                    selectedAnswer,
                })
            )

            const res = await axiosInstance.post(
                `/renshuu/submit/${renshuuId}`,
                {
                    answers: formattedAnswers,
                }
            )

            setResult(res.data.data)
            setToast({
                open: true,
                message: '🎉 Đã nộp bài thành công!',
                severity: 'success',
            })
        } catch (err) {
            console.error(' Submit failed:', err)
            setToast({
                open: true,
                message: ' Gặp lỗi khi nộp bài.',
                severity: 'error',
            })
        }
    }

    const handleCloseToast = () => setToast({ ...toast, open: false })

    if (result) {
        const percentage = Math.round(
            (result.correctAnswers / result.totalQuestions) * 100
        )
        const getLevel = () => {
            if (percentage >= 90) return '🌟 Xuất sắc'
            if (percentage >= 75) return '🎯 Giỏi'
            if (percentage >= 50) return '👍 Khá'
            return '📘 Cần cải thiện'
        }

        return (
            <Paper
                elevation={4}
                className="p-10 rounded-[2rem] bg-gradient-to-br from-[#fff] to-[#fbe9e7] shadow-xl border border-[#f44336]/30"
            >
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={toast.open}
                    autoHideDuration={4000}
                    onClose={handleCloseToast}
                >
                    <Alert
                        onClose={handleCloseToast}
                        severity={toast.severity}
                        variant="filled"
                    >
                        {toast.message}
                    </Alert>
                </Snackbar>

                {/* Header summary */}
                <Box className="text-center mb-12">
                    <Typography
                        variant="h4"
                        className="font-extrabold text-[#c62828]"
                    >
                        {getLevel()}
                    </Typography>
                    <Typography className="text-gray-700 text-base mt-1">
                        Bạn làm đúng <strong>{result.correctAnswers}</strong> /{' '}
                        {result.totalQuestions} câu hỏi
                    </Typography>
                    <Box className="w-full max-w-lg mx-auto mt-4">
                        <LinearProgress
                            variant="determinate"
                            value={percentage}
                            color="error"
                            className="rounded-full h-3"
                        />
                        <Typography
                            variant="caption"
                            display="block"
                            className="mt-1 text-sm text-gray-500"
                        >
                            {percentage}% hoàn thành chính xác
                        </Typography>
                    </Box>
                </Box>

                <Divider className="mb-8" />

                {/* Result Cards */}
                <Grid container spacing={4}>
                    {result.results.map((item, index) => (
                        <Grid item xs={12} md={6} key={item.questionId}>
                            <Card
                                elevation={3}
                                className={`rounded-2xl border-l-[6px] ${item.isCorrect ? 'border-green-500 bg-white' : 'border-red-500 bg-white'}`}
                            >
                                <CardContent className="space-y-3">
                                    <Typography
                                        variant="subtitle1"
                                        className="font-semibold text-gray-800"
                                    >
                                        Câu {index + 1}: {item.question}
                                    </Typography>
                                    <Box className="flex flex-wrap gap-2 text-sm">
                                        <Chip
                                            label={`Bạn chọn: ${item.selectedAnswer}`}
                                            color={
                                                item.isCorrect
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            size="small"
                                        />
                                        <Chip
                                            label={`Đáp án đúng: ${item.correctAnswer}`}
                                            color="success"
                                            size="small"
                                        />
                                        <Chip
                                            label={
                                                item.isCorrect
                                                    ? '✔ Chính xác'
                                                    : '✖ Sai'
                                            }
                                            color={
                                                item.isCorrect
                                                    ? 'success'
                                                    : 'error'
                                            }
                                            size="small"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Footer */}
                <Box className="text-center mt-16">
                    <Button
                        variant="outlined"
                        onClick={onBack}
                        color="error"
                        size="large"
                    >
                        🔁 Làm bài khác
                    </Button>
                </Box>
            </Paper>
        )
    }

    return (
        <Paper
            elevation={3}
            className="p-6 rounded-2xl bg-white shadow-xl border border-red-200"
        >
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
            >
                <Alert
                    onClose={handleCloseToast}
                    severity={toast.severity}
                    variant="filled"
                >
                    {toast.message}
                </Alert>
            </Snackbar>

            <Button
                onClick={onBack}
                variant="outlined"
                color="error"
                className="mb-6"
            >
                ← Quay lại danh sách bài học
            </Button>

            <Typography variant="h5" className="text-[#d32f2f] font-bold mb-6">
                📚 Bài luyện: {lessonTitle}
            </Typography>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <RenshuuQuestionCard
                        key={q._id}
                        index={idx}
                        question={q}
                        selected={answers[q._id]}
                        onSelect={onSelect}
                    />
                ))}
            </div>

            <div className="flex justify-center mt-10">
                <Button
                    variant="contained"
                    color="error"
                    size="large"
                    className="px-10 py-3 rounded-xl shadow-md hover:shadow-lg text-base font-semibold"
                    onClick={handleSubmit}
                >
                    Nộp bài
                </Button>
            </div>
        </Paper>
    )
}
