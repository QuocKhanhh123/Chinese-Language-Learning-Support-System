import { NavLink, useLocation } from 'react-router-dom'
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import GTranslateIcon from '@mui/icons-material/GTranslate'
import SpellcheckIcon from '@mui/icons-material/Spellcheck'
import QuizIcon from '@mui/icons-material/Quiz'
import MenuBookIcon from '@mui/icons-material/MenuBook'

export default function PracticeSidebar() {
    const location = useLocation()

    const menuItems = [
        { label: 'Flashcard', path: 'flashcard', icon: <SchoolIcon /> },
        { label: 'Từ Vựng', path: 'vocabulary', icon: <MenuBookIcon /> },
        { label: 'Chấm phát âm', path: 'voice', icon: <RecordVoiceOverIcon /> },
        { label: 'Tra Cứu', path: 'translate', icon: <GTranslateIcon /> },
        { label: 'Pinyin', path: 'pinyin', icon: <SpellcheckIcon /> },
        // { label: 'Bài thi', path: 'exam', icon: <QuizIcon /> }, // Ẩn tạm thời
    ]

    const isActive = (path) => location.pathname.includes(`/practice/${path}`)

    return (
        <div className="w-64 min-h-screen bg-white border-r shadow-sm px-4 py-6">
            <Typography
                variant="h6"
                color="error"
                fontWeight="bold"
                mb={2}
                fontSize={22}
            >
                Luyện tập
            </Typography>
            <Divider />

            <List>
                {menuItems.map((item) => {
                    const active = isActive(item.path)
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <ListItemButton
                                selected={active}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    backgroundColor: active
                                        ? '#ffe4e6'
                                        : 'transparent',
                                    color: active ? '#d32f2f' : '#333',
                                    '&:hover': {
                                        backgroundColor: '#fce4ec',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{ color: active ? '#d32f2f' : '#888' }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: active ? '600' : '500',
                                    }}
                                />
                            </ListItemButton>
                        </NavLink>
                    )
                })}
            </List>
        </div>
    )
}
