// src/page/Practice/Exam/ExamListPage.jsx
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Divider, Chip, Stack } from '@mui/material'
import { useExamList } from '../../../hooks/useExam'

const levelToColor = (level) => {
  if (!level) return '#b91c1c'
  if (level.includes('1')) return '#2563eb'
  if (level.includes('2')) return '#16a34a'
  if (level.includes('3')) return '#f97316'
  if (level.includes('4')) return '#dc2626'
  if (level.includes('5')) return '#7c3aed'
  if (level.includes('6')) return '#0f766e'
  return '#b91c1c'
}

const ExamListPage = () => {
  const { data: exams, isLoading: isExamLoading } = useExamList()
  const navigate = useNavigate()

  if (isExamLoading)
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ bgcolor: '#f5f5f5' }}
      >
        <Typography variant="h6" color="text.secondary">
          Đang tải danh sách bài thi...
        </Typography>
      </Box>
    )

  if (!exams || exams.length === 0)
    return (
      <Box
        minHeight="60vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ bgcolor: '#f5f5f5' }}
      >
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Chưa có bài thi nào
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vui lòng quay lại sau hoặc liên hệ quản trị viên.
        </Typography>
      </Box>
    )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 0 },
      }}
    >
      <Box
        maxWidth="1120px"
        mx="auto"
        sx={{
          bgcolor: 'white',
          borderRadius: 2.5,
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* HEADER GIỐNG ĐẦU ĐỀ HSK */}
        <Box
          sx={{
            borderBottom: '1px solid #e5e7eb',
            px: { xs: 3, md: 4 },
            py: { xs: 2.5, md: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: '#9ca3af', letterSpacing: 3 }}
            >
              汉语水平考试 · 模拟题
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mt: 0.5,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: 0.5,
              }}
            >
              DANH SÁCH ĐỀ THI HSK
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: '#6b7280', maxWidth: 480 }}
            >
              Chọn một đề để bắt đầu luyện tập. Mỗi lần làm sẽ lưu kết quả và
              phân tích chi tiết từng câu hỏi.
            </Typography>
          </Box>

          <Chip
            label={`Tổng cộng: ${exams.length} đề`}
            sx={{
              borderRadius: '999px',
              fontWeight: 600,
              bgcolor: '#fee2e2',
              color: '#b91c1c',
            }}
          />
        </Box>

        {/* LIST ĐỀ – MỖI ĐỀ GIỐNG MỘT TỜ ĐỀ HSK */}
        <Box
          sx={{
            px: { xs: 1.5, md: 3 },
            py: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {exams.map((exam, idx) => {
            const level = exam.level || 'HSK'
            const timeLimit =
              exam.timeLimitMinutes ?? exam.time_limit ?? exam.time ?? 0
            const totalPoints = exam.totalPoints ?? exam.total_points
            const passingScore = exam.passingScore
            const attempts = exam.stats?.attemptCount
            const color = levelToColor(level)

            return (
              <Box
                key={exam._id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '90px 1fr', md: '120px 1fr' },
                  borderRadius: 2,
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  bgcolor: idx % 2 === 0 ? '#fafafa' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                  '&:hover': {
                    borderColor: '#f97316',
                    bgcolor: '#fff7ed',
                  },
                }}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/practice/exam/${exam._id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/practice/exam/${exam._id}`)
                  }
                }}
              >
                {/* CỘT LEVEL HSK BÊN TRÁI – CẢM GIÁC BÌA ĐỀ */}
                <Box
                  sx={{
                    bgcolor: color,
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: { xs: 2.5, md: 3.5 },
                    px: 1,
                    textAlign: 'center',
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ letterSpacing: 2, opacity: 0.9 }}
                  >
                    HSK
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1,
                      letterSpacing: 1,
                    }}
                  >
                    {level.replace('HSK', '')}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, opacity: 0.9, letterSpacing: 1 }}
                  >
                    模拟考试
                  </Typography>
                </Box>

                {/* PHẦN NỘI DUNG ĐỀ */}
                <Box
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#9ca3af', mb: 0.5 }}
                    >
                      Đề luyện tập HSK
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#111827',
                        lineHeight: 1.3,
                      }}
                    >
                      {exam.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        color: '#6b7280',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {exam.description || 'Không có mô tả cho bài thi này.'}
                    </Typography>
                  </Box>

                  <Box>
                    <Divider sx={{ my: 1.2 }} />
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 0.5, sm: 2.5 }}
                      sx={{
                        fontSize: 13,
                        color: '#4b5563',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>🕒 Thời gian: {timeLimit} phút</span>
                      <span>
                        📊 Số câu:{' '}
                        {totalPoints != null ? totalPoints : '—'}
                      </span>
            
                   
                    </Stack>

                    <Box
                      sx={{
                        mt: 1.5,
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 999,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: 13,
                          px: 2.5,
                          py: 0.5,
                          borderColor: '#f97316',
                          color: '#b45309',
                          '&:hover': {
                            borderColor: '#ea580c',
                            backgroundColor: '#ffedd5',
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/practice/exam/${exam._id}`)
                        }}
                      >
                        Xem chi tiết & bắt đầu
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default ExamListPage