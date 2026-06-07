import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

function DeckSelector({ decks, selectedId, onChange }) {
    return (
        <FormControl sx={{ minWidth: 300 }} size="medium">
            <InputLabel>Bộ thẻ</InputLabel>
            <Select
                value={selectedId || ''}
                label="Bộ thẻ"
                onChange={(e) => onChange(e.target.value)}
            >
                {decks.map((deck) => (
                    <MenuItem key={deck._id} value={deck._id}>
                        {deck.deck_title}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
export default DeckSelector
