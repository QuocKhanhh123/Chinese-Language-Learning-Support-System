import { useFormContext } from 'react-hook-form'

function DateTime() {
    const {
        register,
        formState: { errors },
    } = useFormContext()
    return (
        <div className="flex flex-col gap-4 px-16 h-[380px]">
            <div className="w-full flex gap-3 flex-col">
                <label className="block font-bold">
                    Thời gian bắt đầu làm bài{' '}
                    <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('startTime')}
                    min={new Date().toISOString().slice(0, 16)}
                    type="datetime-local"
                    className="border p-2 w-full rounded py-4 px-4"
                />
                {errors?.startTime && (
                    <p className="text-red-500">{errors.startTime?.message}</p>
                )}
            </div>
            <div className="w-full flex gap-3 flex-col">
                <label className="block font-bold">
                    Thời gian kết thúc làm bài{' '}
                    <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('endTime')}
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    className="border p-2 w-full rounded py-4 px-4"
                />
                {errors.endTime && (
                    <p className="text-red-500">{errors.endTime?.message}</p>
                )}
            </div>
            <div className="w-full flex gap-3 flex-col">
                <label className="block font-bold">
                    Thời gian làm bài (phút){' '}
                    <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('time_limit')}
                    type="number"
                    className="border p-2 w-full rounded py-4 px-4"
                />
                {errors.time_limit && (
                    <p className="text-red-500">{errors.time_limit?.message}</p>
                )}
            </div>
           
        </div>
    )
}

export default DateTime
