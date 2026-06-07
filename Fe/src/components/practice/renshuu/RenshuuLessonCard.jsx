import { Card, CardContent, Typography, Button, Avatar } from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'

export default function RenshuuLessonCard({ lesson, index, onSelect }) {
    return (
        <Card className="rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all">
            <CardContent className="p-5 flex flex-col h-full justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Avatar sx={{ bgcolor: '#d32f2f' }} variant="rounded">
                            <SchoolIcon />
                        </Avatar>
                        <div>
                            <Typography
                                variant="body2"
                                className="text-gray-500"
                            >
                                Bài {index + 1}
                            </Typography>
                            <Typography
                                variant="h6"
                                className="font-semibold text-[#d32f2f]"
                            >
                                {lesson.lesson_title}
                            </Typography>
                        </div>
                    </div>
                    <Typography className="text-sm text-gray-600 leading-relaxed">
                        Luyện tập từ vựng & ngữ pháp cho bài học này.
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => onSelect(lesson._id)}
                    className="mt-5 w-full font-semibold tracking-wide"
                >
                    🎯 Vào luyện tập
                </Button>
            </CardContent>
        </Card>
    )
}
