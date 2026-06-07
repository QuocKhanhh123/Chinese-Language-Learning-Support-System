import React, { useMemo, useState } from 'react'
import axiosInstance from '@/network/httpRequest'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Container,
  IconButton,
  Typography,
  Chip,
  Stack,
  Button,
  Divider,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

function Flashcard() {
  const { deckId } = useParams()
  const navigate = useNavigate()

  const getFlashcardsByDeckId = async () => {
    const res = await axiosInstance.get(
      `/flashcards/student/decks/${deckId}/flashcards`
    )
    // { success, message, statusCode, data: { deck, cards, total } }
    return res.data.data
  }

  const { data: deckData, isLoading } = useQuery({
    queryKey: ['student-flashcards', deckId],
    queryFn: getFlashcardsByDeckId,
    enabled: !!deckId,
  })

  const deckInfo = deckData?.deck || {}
  const cards = deckData?.cards || []
  const totalCards = deckData?.total ?? cards.length

  // Lấy các level HSK từ card hoặc từ deck.tags
  const hskLevels = useMemo(() => {
    const levelSet = new Set()

    cards.forEach((card) => {
      const vLevel = card?.vocabularyData?.level
      const gLevel = card?.grammarData?.level
      if (vLevel) levelSet.add(vLevel)
      if (gLevel) levelSet.add(gLevel)
    })

    const levels = Array.from(levelSet)
    const tags = Array.isArray(deckInfo.tags) ? deckInfo.tags : []

    if (levels.length > 0) return levels
    return tags.filter(
      (t) => typeof t === 'string' && t.toUpperCase().startsWith('HSK')
    )
  }, [cards, deckInfo])

  // State hiển thị flashcard
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = cards[currentIndex] || null
  const total = cards.length

  const handlePrev = () => {
    if (total === 0) return
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }

  const handleNext = () => {
    if (total === 0) return
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % total)
  }

  const handleFlip = () => {
    if (!currentCard) return
    setIsFlipped((prev) => !prev)
  }

  // Chuẩn hoá data hiển thị cho vocabulary / grammar
  const frontData = useMemo(() => {
    if (!currentCard) return null

    if (currentCard.type === 'vocabulary' && currentCard.vocabularyData) {
      const v = currentCard.vocabularyData
      return {
        chinese: v.chinese,
        pinyin: v.pinyin,
        wordType: v.wordType === 'number' ? 'Số đếm' : v.wordType,
        level: v.level,
      }
    }

    if (currentCard.type === 'grammar' && currentCard.grammarData) {
      const g = currentCard.grammarData
      return {
        chinese: g.structure,
        pinyin: 'Ngữ pháp',
        wordType: g.level,
        level: g.level,
      }
    }

    return {
      chinese: currentCard.frontText || 'Không có dữ liệu',
      pinyin: '',
      wordType: '',
      level: '',
    }
  }, [currentCard])

  const backData = useMemo(() => {
    if (!currentCard) return null

    if (currentCard.type === 'vocabulary' && currentCard.vocabularyData) {
      const v = currentCard.vocabularyData
      return {
        vietnamese: v.vietnamese || '',
        chinese: v.chinese || '',
        pinyin: v.pinyin || '',
        note: v.note || '',
        level: v.level || '',
        wordType: v.wordType === 'number' ? 'Số đếm' : v.wordType,
      }
    }

    if (currentCard.type === 'grammar' && currentCard.grammarData) {
      const g = currentCard.grammarData
      return {
        vietnamese: g.explanation || '',
        chinese: g.structure || '',
        pinyin: '',
        note: g.note || '',
        level: g.level || '',
        wordType: 'Ngữ pháp',
      }
    }

    return {
      vietnamese: currentCard.backText || '',
      chinese: currentCard.frontText || '',
      pinyin: '',
      note: '',
      level: '',
      wordType: '',
    }
  }, [currentCard])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #fff1f2, #ffedd5)',
      }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3} columnGap={2}>
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="Back"
            sx={{
              bgcolor: '#fee2e2',
              color: 'error.main',
              border: '1px solid',
              borderColor: 'error.light',
              '&:hover': {
                bgcolor: 'error.main',
                color: 'common.white',
              },
              boxShadow: 2,
              width: 44,
              height: 44,
            }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ flexGrow: 1, userSelect: 'none' }}>
            <Typography
              variant="overline"
              color="error.main"
              sx={{ letterSpacing: 2, fontWeight: 700 }}
            >
              HSK FLASHCARD
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="text.primary"
              sx={{ lineHeight: 1.2 }}
            >
              {deckInfo.title || 'Bộ flashcard'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {deckInfo.description ||
                'Chạm vào thẻ để lật: mặt trước là chữ Hán, mặt sau là nghĩa tiếng Việt.'}
            </Typography>

            {/* Info bar */}
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
              sx={{ mt: 1.5 }}
            >
              {hskLevels.map((level) => (
                <Chip
                  key={level}
                  label={level}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    bgcolor: 'rgba(244, 63, 94, 0.05)',
                  }}
                />
              ))}

              <Chip
                label={`${totalCards} thẻ`}
                size="small"
                variant="outlined"
              />

              {deckInfo.createdBy?.name && (
                <Chip
                  label={`GV: ${deckInfo.createdBy.name}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        </Box>

        {/* Divider gradient */}
        <Box
          sx={{
            height: 3,
            mb: 4,
            borderRadius: 2,
            background:
              'linear-gradient(90deg, #fed7e2 0%, #fb7185 50%, #fed7e2 100%)',
          }}
        />

        {/* Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            rowGap: 3,
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                height: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
              >
                Đang tải thẻ...
              </Typography>
            </Box>
          ) : total === 0 ? (
            <Box
              sx={{
                height: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
              >
                Chưa có thẻ trong bộ này.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Index + loại */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 520,
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Thẻ {currentIndex + 1}/{total}
                </Typography>
                {currentCard?.type && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    {currentCard.type === 'vocabulary'
                      ? 'Từ vựng'
                      : currentCard.type === 'grammar'
                      ? 'Ngữ pháp'
                      : 'Flashcard'}
                  </Typography>
                )}
              </Box>

              {/* FLASHCARD: chạm để lật – 3D rotateY giống FlashcardDetail */}
              <Box
                onClick={handleFlip}
                sx={{
                  width: '100%',
                  maxWidth: 520,
                  height: { xs: 320, md: 380 },
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
                  {/* MẶT TRƯỚC */}
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
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        letterSpacing: 2,
                        color: 'rgba(255,255,255,0.9)',
                        mb: 1,
                      }}
                    >
                      MẶT TRƯỚC · TIẾNG TRUNG
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: { xs: '3.8rem', md: '4.6rem' },
                        fontWeight: 900,
                        lineHeight: 1.1,
                        textAlign: 'center',
                      }}
                    >
                      {frontData?.chinese || '—'}
                    </Typography>

                    {frontData?.pinyin && (
                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: '1.4rem',
                          color: 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {frontData.pinyin}
                      </Typography>
                    )}

                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      sx={{ mt: 1 }}
                    >
                      {frontData?.level && (
                        <Chip
                          label={frontData.level}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.3)',
                            border: '1px solid',
                          }}
                        />
                      )}
                      {frontData?.wordType && (
                        <Chip
                          label={frontData.wordType}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.12)',
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.25)',
                            border: '1px solid',
                          }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255,255,255,0.8)', mt: 1.5 }}
                    >
                      Nhấn để lật
                    </Typography>
                  </Box>

                  {/* MẶT SAU */}
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
                    <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          letterSpacing: 2,
                          color: '#10b981',
                          mb: 1,
                          display: 'block',
                        }}
                      >
                        MẶT SAU · NGHĨA TIẾNG VIỆT
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: '2rem',
                          color: '#059669',
                          fontWeight: 700,
                        }}
                      >
                        {backData?.vietnamese || ''}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Hán + pinyin + chip ở dưới */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {backData?.chinese || ''}
                      </Typography>
                      {backData?.pinyin && (
                        <Typography
                          variant="body2"
                          sx={{ color: '#fb7185', mb: 0.5 }}
                        >
                          {backData.pinyin}
                        </Typography>
                      )}
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        sx={{ mt: 0.5 }}
                      >
                        {backData?.level && (
                          <Chip
                            label={backData.level}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {backData?.wordType && (
                          <Chip
                            label={backData.wordType}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Box>

                    {backData?.note && (
                      <Box sx={{ mt: 1, textAlign: 'center' }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Ghi chú: {backData.note}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        Nhấn để lật lại
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Điều hướng Prev / Next */}
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mt: 2 }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handlePrev}
                >
                  ‹ Trước
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleNext}
                >
                  Sau ›
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Container>
    </Box>
  )
}

export default Flashcard