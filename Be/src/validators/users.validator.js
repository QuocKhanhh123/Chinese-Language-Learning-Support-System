


const { z } = require('zod');

const createUserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email("Email không hợp lệ"),
    date_of_birth: z.preprocess((arg) => {
        if (typeof arg == 'string') {
            const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            const match = arg.match(ddmmyyyy);
            if (match) {
                const day = parseInt(match[1]);
                const month = parseInt(match[2]);
                const year = parseInt(match[3]);
                return new Date(year, month - 1, day);
            }
            return new Date(arg);
        }
        if (arg instanceof Date) return arg;
    }, z.date().refine((date) => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 5;
    }, { message: "Tuổi phải từ 5 trở lên" })),
    sex: z.enum(['male', 'female', 'other']),
    phone: z.string().min(10).max(15).optional(),
    role: z.enum(['student', 'teacher', 'admin'])
});

const getUsersSchema = z.object({
    role: z.enum(['student', 'teacher', 'admin']).optional(),
    page: z.string().transform((val) => parseInt(val)).optional().default("1"),
    limit: z.string().transform((val) => parseInt(val)).optional().default("10"),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(6, "Mật khẩu cũ phải có ít nhất 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

module.exports = {
    createUserSchema,
    getUsersSchema,
    changePasswordSchema
};