// File: MemoryCardGame.jsx
import React, { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Paper,
    Typography,
    Modal,
    Divider,
    Slide,
    Fade,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { shuffle } from 'lodash'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import WarningIcon from '@mui/icons-material/Warning'
import HistoryIcon from '@mui/icons-material/History'
import axiosInstance from '@/network/httpRequest'
import useAuthStore from '@/store/useAuthStore'

const correctAudio = new Audio(
    'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3'
)
const wrongAudio = new Audio(
    'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'
)

function MemoryCardGame() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const flashcards = location.state?.flashcards || []

    const [cards, setCards] = useState([])
    const [flippedCards, setFlippedCards] = useState([])
    const [matchedPairs, setMatchedPairs] = useState([])
    const [gameOver, setGameOver] = useState(false)
    const [hintUsed, setHintUsed] = useState(false)
    const [timer, setTimer] = useState(0)

    const [openHistory, setOpenHistory] = useState(false)
    const [historyList, setHistoryList] = useState([])

    const generateCards = () => {
        const splitCards = flashcards.flatMap((card, i) => [
            {
                id: `${i}-ja`,
                pairId: i.toString(),
                text: card.front,
                lang: 'ja',
            },
            {
                id: `${i}-vi`,
                pairId: i.toString(),
                text: card.back,
                lang: 'vi',
            },
        ])
        setCards(shuffle(splitCards))
    }

    const speakText = (text, lang = 'ja-JP') => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        speechSynthesis.speak(utterance)
    }

    const saveGameResult = async () => {
        try {
            await axiosInstance.post('progress/game-result', {
                userId: user._id,
                gameType: 'MemoryCard',
                correctPairs: matchedPairs.length,
                totalCards: flashcards.length,
                duration: timer,
            })
        } catch (error) {
            console.error('Lỗi khi lưu kết quả game:', error)
        }
    }

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get('progress/game-history', {
                params: { userId: user._id, gameType: 'MemoryCard' },
            })
            setHistoryList(res.data.data || [])
            setOpenHistory(true)
        } catch (error) {
            toast.error('Lỗi khi tải lịch sử game')
        }
    }

    useEffect(() => {
        if (!flashcards.length) {
            toast.warn(
                <span>
                    <WarningIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Không có dữ liệu flashcard. Quay lại chọn bộ thẻ.
                </span>
            )
            setTimeout(() => navigate(-1), 2000)
            return
        }
        generateCards()
        const savedScore = localStorage.getItem('highestScore')
        if (savedScore) {
            toast.info(
                <span>
                    <EmojiEventsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Điểm cao hiện tại: {savedScore}
                </span>
            )
        }
    }, [])

    const handleCardClick = (index) => {
        if (flippedCards.length < 2 && !flippedCards.includes(index)) {
            const newFlipped = [...flippedCards, index]
            setFlippedCards(newFlipped)
            speakText(
                cards[index].text,
                cards[index].lang === 'ja' ? 'ja-JP' : 'vi-VN'
            )

            if (newFlipped.length === 2) {
                const [first, second] = newFlipped
                const isMatch =
                    cards[first].pairId === cards[second].pairId &&
                    cards[first].lang !== cards[second].lang

                if (isMatch) {
                    setMatchedPairs((prev) => [...prev, cards[first].pairId])
                    toast.success(
                        <span>
                            <CheckCircleIcon
                                sx={{ verticalAlign: 'middle', mr: 1 }}
                            />
                            Bạn đã đoán đúng!
                        </span>
                    )
                    correctAudio.play()
                } else {
                    toast.error(
                        <span>
                            <ErrorIcon
                                sx={{ verticalAlign: 'middle', mr: 1 }}
                            />
                            Bạn đoán sai!
                        </span>
                    )
                    wrongAudio.play()
                }
                setTimeout(() => setFlippedCards([]), 1000)
            }
        }
    }

    useEffect(() => {
        if (matchedPairs.length === flashcards.length) {
            setGameOver(true)
            toast.success(
                <span>
                    <EmojiEventsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Bạn đã hoàn thành trò chơi!
                </span>
            )
            saveGameResult()
            const highestScore = localStorage.getItem('highestScore') || 0
            const newScore = matchedPairs.length
            if (newScore > highestScore) {
                localStorage.setItem('highestScore', newScore)
                toast.success(
                    <span>
                        <EmojiEventsIcon
                            sx={{ verticalAlign: 'middle', mr: 1 }}
                        />
                        Kỷ lục mới: {newScore}!
                    </span>
                )
            }
        }
    }, [matchedPairs])

    const resetGame = () => {
        generateCards()
        setFlippedCards([])
        setMatchedPairs([])
        setGameOver(false)
        setHintUsed(false)
        setTimer(0)
        toast.info(
            <span>
                <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Trò chơi bắt đầu lại!
            </span>
        )
    }

    const useHint = () => {
        setHintUsed(true)
        const hintCard = cards.find(
            (card) =>
                !flippedCards.includes(cards.indexOf(card)) &&
                !matchedPairs.includes(card.pairId)
        )
        if (hintCard) {
            toast(
                <span>
                    <LightbulbIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Gợi ý: Thẻ "{hintCard.text}"
                </span>,
                { type: 'info' }
            )
        }
    }

    useEffect(() => {
        let interval
        if (!gameOver) {
            interval = setInterval(() => setTimer((prev) => prev + 1), 1000)
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [gameOver])

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={4}
            sx={{ fontFamily: '"Noto Sans JP", sans-serif', py: 4 }}
        >
            <Typography variant="h4" fontWeight="bold">
                Ghép cặp Nhật – Việt
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: 2,
                    width: '100%',
                    maxWidth: 500,
                }}
            >
                {cards.map((card, index) => {
                    const isFlipped =
                        flippedCards.includes(index) ||
                        matchedPairs.includes(card.pairId)
                    return (
                        <Fade in key={card.id} timeout={300}>
                            <Paper
                                sx={{
                                    height: 100,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isFlipped
                                        ? '#fff'
                                        : '#DC2626',
                                    cursor: 'pointer',
                                    boxShadow: 4,
                                    borderRadius: 2,
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                    },
                                }}
                                onClick={() => handleCardClick(index)}
                            >
                                <Typography
                                    variant="h6"
                                    color={isFlipped ? 'black' : 'transparent'}
                                    sx={{ textAlign: 'center' }}
                                >
                                    {isFlipped ? card.text : '?'}
                                </Typography>
                            </Paper>
                        </Fade>
                    )
                })}
            </Box>

            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
                {gameOver ? (
                    <Button variant="contained" onClick={resetGame}>
                        Chơi lại
                    </Button>
                ) : (
                    <Typography variant="h6">
                        {matchedPairs.length} / {flashcards.length} cặp đúng
                    </Typography>
                )}
                {!hintUsed && !gameOver && (
                    <Button variant="outlined" onClick={useHint}>
                        Gợi ý
                    </Button>
                )}
                <Button
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={fetchHistory}
                >
                    Xem lịch sử
                </Button>
            </Box>

            <Typography variant="h6">Thời gian: {timer}s</Typography>

            <Modal open={openHistory} onClose={() => setOpenHistory(false)}>
                <Slide
                    direction="up"
                    in={openHistory}
                    mountOnEnter
                    unmountOnExit
                >
                    <Box
                        sx={{
                            background: '#fff',
                            maxWidth: 400,
                            mx: 'auto',
                            mt: 10,
                            p: 3,
                            borderRadius: 2,
                            boxShadow: 8,
                            maxHeight: '80vh',
                            overflowY: 'auto',
                        }}
                    >
                        <Typography variant="h6" mb={2} fontWeight="bold">
                            Lịch sử chơi
                        </Typography>
                        {historyList.length === 0 ? (
                            <Typography textAlign="center">
                                Không có dữ liệu.
                            </Typography>
                        ) : (
                            historyList.map((h, idx) => (
                                <Box key={idx} mb={2}>
                                    <Typography fontWeight="bold">
                                        {new Date(h.playedAt).toLocaleString()}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography>
                                        Cặp đúng: {h.correctPairs} /{' '}
                                        {h.totalCards}
                                    </Typography>
                                    <Typography>
                                        Thời gian: {h.duration}s
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>
                </Slide>
            </Modal>
        </Box>
    )
}

export default MemoryCardGame
