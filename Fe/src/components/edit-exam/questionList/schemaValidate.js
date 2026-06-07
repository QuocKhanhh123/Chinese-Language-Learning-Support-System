import { z } from 'zod'

const optionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Option text is required'),
    _id: z.string().optional(),
})

const childQuestionSchema = z.object({
    id: z.string().optional(),
    content: z.string().min(1, 'Child question content is required'),
    correctAnswer: z.string().min(1, 'Correct answer is required'),
    options: z.array(optionSchema).min(2, 'At least two options are required'),
})

export const singleQuestionSchema = z.object({
    parentQuestion: z.string().min(1, 'Parent question type is required'),
    paragraph: z.string().optional(),
    imgUrl: z.string().optional(),
    audioUrl: z.string().optional(),
    childQuestions: z
        .array(childQuestionSchema)
        .min(1, 'At least one child question is required'),
    _id: z.string().optional(),

    type: z.string().optional(),
    point: z.number().optional(),
    instruction: z.string().optional(),
})

export const formSchema = z.object({
    questions: z.array(singleQuestionSchema),
})
