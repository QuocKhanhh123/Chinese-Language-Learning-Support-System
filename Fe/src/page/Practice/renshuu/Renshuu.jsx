import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRenshuu } from '@/hooks/useRenshuu'
import axiosInstance from '@/network/httpRequest'
import RenshuuLessonCard from '@/components/practice/renshuu/RenshuuLessonCard'
import RenshuuPractice from '@/components/practice/renshuu/RenshuuPractice'

export default function RenshuuPage() {
    const [selectedLessonId, setSelectedLessonId] = useState(null)
    const [answers, setAnswers] = useState({})

    const { data: lessons } = useQuery({
        queryKey: ['lessons'],
        queryFn: async () => {
            const res = await axiosInstance.get('/lesson/all/titles')
            return res.data.data
        },
    })

    console.log('lessons', lessons)

    const { data } = useRenshuu(selectedLessonId)

    const handleSelect = (questionId, optionId) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
    }

    return (
        <div className="max-w-6xl mx-auto px-2 py-3 space-y-10">
            <div className="text-center space-y-2">
                <h1 className="text-[#ec2e2e] font-extrabold text-3xl md:text-4xl">
                     Renshuu Luyện Tập Tiếng Nhật
                </h1>
                <p className="text-gray-600 text-base">
                    Rèn luyện kỹ năng dịch, phản xạ và ghi nhớ với các bài luyện
                    tập thực tế ✨
                </p>
            </div>

            {!selectedLessonId ? (
                <>
                    <h2 className="text-xl font-bold text-[#d32f2f] mb-1">
                        📘 Danh sách bài học
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons?.map((lesson, idx) => (
                            <RenshuuLessonCard
                                key={lesson._id}
                                index={idx}
                                lesson={lesson}
                                onSelect={setSelectedLessonId}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <RenshuuPractice
                    lessonTitle={
                        lessons?.find((l) => l._id === selectedLessonId)
                            ?.lesson_title
                    }
                    questions={data?.questions || []}
                    answers={answers}
                    onSelect={handleSelect}
                    onBack={() => {
                        setSelectedLessonId(null)
                        setAnswers({})
                    }}
                    renshuuId={data?._id}
                />
            )}
        </div>
    )
}
