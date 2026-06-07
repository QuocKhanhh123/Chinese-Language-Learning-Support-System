// src/pages/flashcards/FlashcardDetail.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowBack } from '@mui/icons-material'
import axiosInstance from '@/network/httpRequest'
import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Typography,
  LinearProgress,
  IconButton,
} from '@mui/material'

function FlashcardDetail() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Nếu bạn dùng Bearer token, có thể chặn fetch khi không có token:
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const { data, isLoading, isError } = useQuery({
    queryKey: ['deckDetail', deckId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/flashcards/flashcards/deck/${deckId}`)
      return res.data?.data
    },
    enabled: !!deckId && !!token, // chỉ fetch khi có deckId và token
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false
      return failureCount < 2
    },
  })

  // Chuẩn hoá dữ liệu theo type (vocabulary / grammar)
  const cards = useMemo(() => {
    const raw = data?.cards ?? []
    return raw.map((c) => {
      if (c?.type === 'vocabulary') {
        const v = c?.vocabularyData ?? {}
        return {
          id: c?._id,
          type: 'vocabulary',
          level: v?.level ?? '',
          wordType: v?.wordType ?? '',
          chinese: v?.chinese ?? '',
          pinyin: v?.pinyin ?? '',
          vietnamese: v?.vietnamese ?? '',
          example: {
            chinese: v?.example?.chinese ?? '',
            pinyin: v?.example?.pinyin ?? '',
            vietnamese: v?.example?.vietnamese ?? '',
          },
        }
      }

      // grammar
      const g = c?.grammarData ?? {}
      const firstEx = Array.isArray(g?.examples) ? g.examples[0] : null
      return {
        id: c?._id,
        type: 'grammar',
        level: g?.level ?? '',
        wordType: 'grammar',
        // Dùng structure làm "mặt trước" (tận dụng field chinese để tái sử dụng UI)
        chinese: g?.structure ?? '',
        pinyin: '',
        // Mặt sau hiển thị explanation như "nghĩa"
        vietnamese: g?.explanation ?? '',
        example: {
          chinese: firstEx?.chinese ?? '',
          pinyin: firstEx?.pinyin ?? '',
          vietnamese: firstEx?.vietnamese ?? '',
        },
        _allExamples: Array.isArray(g?.examples) ? g.examples : [],
      }
    })
  }, [data])

  const deckTitle = data?.deck?.title || 'Flashcards'

  // Điều hướng & flip
  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1)
      setIsFlipped(false)
    }
  }
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setIsFlipped(false)
    }
  }
  const toggleFlip = () => setIsFlipped((f) => !f)

  // Phím tắt
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'ArrowRight') nextCard()
      else if (e.code === 'ArrowLeft') prevCard()
      else if (e.code === 'Space') { e.preventDefault(); toggleFlip() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, cards.length])

  if (!token) {
    return (
      <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
          <Typography sx={{ mb: 2 }}>Bạn cần đăng nhập để xem bộ thẻ.</Typography>
          <Button variant="contained" color="error" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </Box>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    )
  }

  if (isError || !data) {
    return <div className="p-6 text-red-500">Không thể tải dữ liệu flashcard.</div>
  }

  if (!cards.length) {
    return (
      <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={800}>
              {deckTitle}
            </Typography>
            <Button
              onClick={() => navigate(-1)}
              variant="outlined"
              color="error"
              startIcon={<ArrowBack />}
              sx={{ borderRadius: '9999px', textTransform: 'none' }}
            >
              Quay lại
            </Button>
          </Box>
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            Chưa có thẻ nào trong bộ này.
          </Typography>
        </Box>
      </Box>
    )
  }

  const cur = cards[currentIndex]
  const progress = Math.round(((currentIndex + 1) / cards.length) * 100)

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafafa' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 3 }}>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            overflow: 'hidden',
            boxShadow: 1,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={deckTitle}
              >
                Học Flashcards: {deckTitle}
              </Typography>
              {cur?.level ? (
                <Chip
                  size="small"
                  label={(cur.level || '').toUpperCase()}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.35)',
                    border: '1px solid',
                    fontWeight: 700,
                  }}
                />
              ) : null}
              {cur?.wordType ? (
                <Chip
                  size="small"
                  label={cur.wordType}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.12)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    border: '1px solid',
                    fontWeight: 600,
                  }}
                />
              ) : null}
            </Box>

            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
              }}
            >
              <ArrowBack />
            </IconButton>
          </Box>

          {/* Progress */}
          <Box sx={{ px: 2, pt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: 'rgba(244,67,54,0.15)',
                '& .MuiLinearProgress-bar': { bgcolor: 'error.main' },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Thẻ {currentIndex + 1}/{cards.length}
              </Typography>
             
            </Box>
          </Box>

          {/* Body */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Flip card */}
            <Box
              onClick={toggleFlip}
              sx={{
                width: '100%',
                maxWidth: 520,
                height: 340,
                perspective: '1000px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transition: 'transform 0.6s',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'none',
                }}
              >
                {/* Front */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    bgcolor: 'error.main',
                    color: 'white',
                    borderRadius: 2,
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    px: 3,
                    textAlign: 'center',
                    backgroundImage:
                      'radial-gradient(12px 12px at 12px 12px, rgba(255,255,255,0.08) 20%, transparent 21%)',
                    backgroundSize: '24px 24px',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1, textAlign: 'center' }}>
                    {cur?.chinese}
                  </Typography>
                  {cur?.pinyin ? (
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {cur.pinyin}
                    </Typography>
                  ) : null}
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Nhấn để lật
                  </Typography>
                </Box>

                {/* Back */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    bgcolor: 'white',
                    color: 'text.primary',
                    borderRadius: 2,
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    px: 3,
                    py: 2.5,
                    justifyContent: 'center',
                  }}
                >
                  {cur?.type === 'vocabulary' ? (
                    <>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, textAlign: 'center', mb: 0.5 }}
                      >
                        {cur?.vietnamese}
                      </Typography>

                      {(cur?.example?.chinese || cur?.example?.pinyin || cur?.example?.vietnamese) && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(244,67,54,0.06)',
                            border: '1px dashed rgba(244,67,54,0.25)',
                          }}
                        >
                          {cur?.example?.chinese && (
                            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                              {cur.example.chinese}
                            </Typography>
                          )}
                          {cur?.example?.pinyin && (
                            <Typography sx={{ color: 'text.secondary', mt: 0.25 }}>
                              {cur.example.pinyin}
                            </Typography>
                          )}
                          {cur?.example?.vietnamese && (
                            <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
                              {cur.example.vietnamese}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </>
                  ) : (
                    // GRAMMAR
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 900, textAlign: 'center' }}>
                        Giải thích
                      </Typography>
                      <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 1 }}>
                        {cur?.vietnamese}
                      </Typography>

                      {Array.isArray(cur?._allExamples) && cur._allExamples.length > 0 && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(244,67,54,0.06)',
                            border: '1px dashed rgba(244,67,54,0.25)',
                            maxHeight: 180,
                            overflowY: 'auto',
                          }}
                        >
                          {cur._allExamples.map((ex, idx) => (
                            <Box key={idx} sx={{ mb: 1.25 }}>
                              {ex?.chinese && (
                                <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
                                  {ex.chinese}
                                </Typography>
                              )}
                              {ex?.pinyin && (
                                <Typography sx={{ color: 'text.secondary', mt: 0.25 }}>
                                  {ex.pinyin}
                                </Typography>
                              )}
                              {ex?.vietnamese && (
                                <Typography sx={{ color: 'text.secondary', mt: 0.25 }}>
                                  {ex.vietnamese}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </>
                  )}

                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}
                  >
                    Nhấn để lật lại
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Navigation */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                onClick={prevCard}
                disabled={currentIndex === 0}
                variant="outlined"
                color="error"
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Trước
              </Button>
              <Button
                onClick={nextCard}
                disabled={currentIndex === cards.length - 1}
                variant="contained"
                color="error"
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Tiếp
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default FlashcardDetail
