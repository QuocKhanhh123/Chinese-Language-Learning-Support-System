import axiosInstance from '@/network/httpRequest'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, Tabs, TabsList, TabsTab } from '@mantine/core'
import { Settings, TimerOutlined } from '@mui/icons-material'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'
import DateTime from './tabs/DateTime'
import Details from './tabs/Details'

function ExamModal({ opened, close, examData, onSubmitCallback }) {
    const schema = z
        .object({
            startTime: z.string().nonempty({ message: 'Không được để trống' }),
            endTime: z.string().nonempty({ message: 'Không được để trống' }),
            time_limit: z.union([
                z.number().min(1, 'Thời gian làm bài phải lớn hơn 0 phút'),
                z.string().regex(/^\d+$/, 'Thời gian làm bài phải là số'),
            ]),
            level: z.string().nonempty('Vui lòng chọn cấp độ bài thi'),
            title: z.string().nonempty('Không được để trống'),
            description: z.string(),
            courseId: z.string().nonempty(),
        })
        .refine(
            (data) => {
                const start = new Date(data.startTime)
                const end = new Date(data.endTime)
                return start < end
            },
            {
                message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
                path: ['endTime'],
            }
        )
        .refine(
            (data) => {
                const now = new Date()
                const start = new Date(data.startTime)
                return start > now
            },
            {
                message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại',
                path: ['startTime'],
            }
        )
        .refine(
            (data) => {
                const start = new Date(data.startTime)
                const end = new Date(data.endTime)
                const range = data.time_limit * 60 * 1000
                return end - start > range
            },
            {
                message: 'Khoảng thời gian bắt đầu và kết thúc không hợp lệ',
                path: ['startTime'],
            }
        )
    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            startTime: '',
            endTime: '',
            time_limit: '',
            level: '',
            title: '',
            description: '',
            courseId: '',
        },
    })

    useEffect(() => {
        if (examData) {
            methods.reset({
                startTime: examData.startTime
                    ? dayjs(examData.startTime).format('YYYY-MM-DDTHH:mm')
                    : '',
                endTime: examData.endTime
                    ? dayjs(examData.endTime).format('YYYY-MM-DDTHH:mm')
                    : '',
                time_limit: examData?.timeLimitMinutes,
                level: examData?.level,
                title: examData?.title,
                description: examData?.description,
                courseId: examData?.course._id,
            })
        }
    }, [examData, methods, methods.reset])

    const onSubmit = async (data) => {
        try {
          if (Object.keys(methods.formState.errors).length > 0) {
            toast.error('Đã xảy ra lỗi, vui lòng kiểm tra lại')
            return
          }
      
          const payload = {
            startAt: data.startTime ? new Date(data.startTime).toISOString() : null,
            endAt: data.endTime ? new Date(data.endTime).toISOString() : null,
            timezone: 'Asia/Ho_Chi_Minh',
          }
      
          const res = await axiosInstance.put(
            `exams/${examData?._id}/schedule`,
            payload
          )
      
          if (res.status === 200) {
            toast.success('Cài đặt bài thi đã được lưu thành công!')
            onSubmitCallback()
            close()
          }
        } catch (error) {
            console.error('Error updating exam schedule:', error)

            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                toast.error(`Lỗi: ${error.response.data.message}`)
            } else {
                toast.error(
                    'Đã xảy ra lỗi không xác định, vui lòng thử lại sau.'
                )
            }
        }
    }

    const isStartTimeBeforeNow = examData?.startTime
        ? dayjs(examData.startTime).isBefore(dayjs())
        : false

    return (
        <Modal
            opened={opened}
            onClose={close}
            title="Cài đặt bài thi"
            size={900}
        >
            {isStartTimeBeforeNow ? (
                <p className="text-red-500 font-semibold">
                    Không được phép chỉnh sửa vì thời gian bắt đầu đã qua.
                </p>
            ) : (
                <FormProvider {...methods}>
                    <form
                        onSubmit={methods.handleSubmit(onSubmit)}
                        className="flex flex-col gap-6 h-[450px]  relative"
                    >
                        <Tabs
                            defaultValue="details"
                            variant="pills"
                            orientation="vertical"
                            color="#DC2626"
                        >
                            <TabsList>
                                <TabsTab
                                    value="details"
                                    leftSection={<Settings />}
                                >
                                    Cài đặt chung
                                </TabsTab>
                                <TabsTab
                                    value="dateTime"
                                    leftSection={<TimerOutlined />}
                                >
                                    Thời gian
                                </TabsTab>
                            </TabsList>
                            <Tabs.Panel value="details">
                                <Details />
                            </Tabs.Panel>
                            <Tabs.Panel value="dateTime">
                                <DateTime />
                            </Tabs.Panel>
                        </Tabs>
                        <div className="flex justify-end fixed bottom-8 right-8">
                            <button
                                className="bg-green-600 text-white px-4 py-3 rounded-md"
                                type="submit"
                            >
                                Lưu cài đặt
                            </button>
                        </div>
                    </form>
                </FormProvider>
            )}
        </Modal>
    )
}

export default ExamModal
