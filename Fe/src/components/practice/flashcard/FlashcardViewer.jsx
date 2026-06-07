import {
    Box,
    Button,
    IconButton,
    Paper,
    Stack,
    Typography,
    useTheme,
} from '@mui/material'
import { useState } from 'react'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { useNavigate } from 'react-router-dom'
import { ArrowBackIosNew, ArrowForwardIos, Games } from '@mui/icons-material'

function FlashcardViewer({ flashcards }) {
    const theme = useTheme()
    const [index, setIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const navigate = useNavigate()

    const card = flashcards[index]

    const speakJapanese = (text) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ja-JP'
        speechSynthesis.speak(utterance)
    }

    const nextCard = () => {
        setFlipped(false)
        setIndex((prev) => (prev + 1) % flashcards.length)
    }

    const prevCard = () => {
        setFlipped(false)
        setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
            <Typography variant="h6" color="text.secondary">
                {index + 1} / {flashcards.length}
            </Typography>

            <Box
                sx={{
                    width: { xs: '100%', sm: 500, md: 600 },
                    height: { xs: 300, sm: 350, md: 400 },
                    perspective: '1000px',
                    cursor: 'pointer',
                }}
                onClick={() => setFlipped(!flipped)}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s',
                        transform: flipped ? 'rotateY(180deg)' : 'none',
                    }}
                >
                    {/* Front side */}
                    <Paper
                        elevation={6}
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            borderRadius: 3,
                            bgcolor:
                                theme.palette.mode === 'dark'
                                    ? '#1e1e1e'
                                    : '#DC2626',
                        }}
                    >
                        <Typography
                            variant="h3"
                            fontWeight="bold"
                            textAlign="center"
                            color="white"
                        >
                            {card.front}
                        </Typography>
                        <IconButton
                            sx={{ mt: 2 }}
                            onClick={(e) => {
                                e.stopPropagation() // không lật card khi bấm
                                speakJapanese(card.front)
                            }}
                        >
                            <VolumeUpIcon
                                sx={{ color: 'white', fontSize: 40 }}
                            />
                        </IconButton>
                    </Paper>

                    {/* Back side */}
                    <Paper
                        elevation={6}
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            borderRadius: 3,
                            bgcolor:
                                theme.palette.mode === 'dark'
                                    ? '#2b2b2b'
                                    : '#fff7e6',
                        }}
                    >
                        <Typography variant="h4" textAlign="center">
                            {card.back}
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            <Stack direction="row" spacing={3} alignItems="center">
                <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    onClick={prevCard}
                    aria-label="Card trước"
                >
                    <ArrowBackIosNew />
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={nextCard}
                    aria-label="Card tiếp"
                >
                    <ArrowForwardIos />
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={() =>
                        navigate('/practice/memory', {
                            state: { flashcards },
                        })
                    }
                    aria-label="Chơi Memory Game"
                    title="Chơi Memory Game"
                >
                    <Games fontSize="medium" />
                </Button>
            </Stack>
        </Box>
    )
}

export default FlashcardViewer
