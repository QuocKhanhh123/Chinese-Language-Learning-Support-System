import {
    Card,
    CardContent,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material'

export default function RenshuuQuestionCard({
    question,
    index,
    selected,
    onSelect,
}) {
    return (
        <Card className="rounded-xl border border-gray-100 bg-[#fffafa] hover:shadow-md transition-all">
            <CardContent>
                <Typography className="text-md font-bold text-[#b71c1c] mb-3">
                    Câu {index + 1}: {question.content}
                </Typography>
                <RadioGroup
                    value={selected || ''}
                    onChange={(e) => onSelect(question._id, e.target.value)}
                >
                    {question.options.map((opt) => (
                        <FormControlLabel
                            key={opt._id}
                            value={opt.id}
                            control={<Radio color="error" />}
                            label={
                                <span className="text-gray-800">
                                    {opt.text}
                                </span>
                            }
                        />
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
    )
}
