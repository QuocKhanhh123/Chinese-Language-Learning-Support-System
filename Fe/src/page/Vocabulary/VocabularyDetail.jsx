import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axiosInstance from '@/network/httpRequest'
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

/**
 * VocabularyDetail.jsx
 * Phù hợp với schema Trung:
 * {
 *   _id,
 *   chinese, pinyin, vietnamese,
 *   example?: { chinese?, pinyin?, vietnamese? },
 *   note?: string,
 *   level?: 'HSK1' | ... | 'HSK6',
 *   wordType?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other',
 *   audioUrl?: string,
 *   createdAt?, updatedAt?
 * }
 */

const tryFetch = async (id) => {
  const endpoints = [
    `/vocabularies/details/${id}`,   // ✔ đúng với BE
    `/vocabularies/${id}`,           // fallback
  ];

  let lastErr;
  for (const path of endpoints) {
    try {
      const res = await axiosInstance.get(path)
      return res?.data?.data ?? res?.data
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

const fieldLabel = (key) => ({
  chinese: 'Từ tiếng Trung',
  pinyin: 'Pinyin',
  vietnamese: 'Nghĩa tiếng Việt',
}[key] || key)

const speakChinese = (text) => {
  if (!text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.6;      // ✔ tốc độ chậm ─ đọc từ từ
  u.pitch = 1;       // giọng tự nhiên
  u.volume = 1;      // to rõ

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

const copy = async (txt) => {
  try {
    await navigator.clipboard.writeText(txt)
  } catch {
    console.error('Failed to copy text')
  }
}

const Row = ({ label, value, italic }) => (
  <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 1.5 }}>
    <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 140 }}>
      {label}:
    </Typography>
    <Typography variant="body1" sx={{ fontStyle: italic ? 'italic' : 'normal' }}>
      {value || '—'}
    </Typography>
    {value && (
      <Tooltip title="Copy">
        <IconButton size="small" onClick={() => copy(value)}>
          <ContentCopyIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    )}
  </Stack>
)

export default function VocabularyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const vocab = await tryFetch(id)
        if (!mounted) return
        setData(vocab)
      } catch (e) {
        if (!mounted) return
        console.error('Fetch vocabulary failed:', e)
        setError(e?.response?.data?.message || 'Không tải được chi tiết từ vựng')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  const created = useMemo(() => (data?.createdAt ? new Date(data.createdAt) : null), [data])
  const updated = useMemo(() => (data?.updatedAt ? new Date(data.updatedAt) : null), [data])

  if (loading) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={42} sx={{ mb: 3 }} />
        <Skeleton variant="text" height={56} width="40%" />
        <Skeleton variant="rectangular" height={220} sx={{ mt: 2, borderRadius: 2 }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Quay lại
        </Button>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography color="error" variant="h6" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng thử lại, hoặc đảm bảo ID/endpoint hợp lệ.
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (!data) return null

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outlined">
          Quay lại danh sách
        </Button>
        <Stack direction="row" spacing={1}>
          {data.level && <Chip size="small" label={data.level} color="warning" variant="outlined" />}
          {data.wordType && <Chip size="small" label={data.wordType} variant="outlined" />}
        </Stack>
      </Stack>

      <Typography variant="h3" fontWeight={800} color="error.main" gutterBottom>
        {data.chinese || '—'}
        {data.chinese && (
          <Tooltip title="Phát âm (TTS)">
            <IconButton onClick={() => speakChinese(data.chinese)} size="large" sx={{ ml: 1 }}>
              <VolumeUpIcon />
            </IconButton>
          </Tooltip>
        )}
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Row label={fieldLabel('pinyin')} value={data.pinyin} italic />
        <Row label={fieldLabel('vietnamese')} value={data.vietnamese} />

        {data.example && (data.example.chinese || data.example.pinyin || data.example.vietnamese) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Ví dụ
            </Typography>
            <Row label="CN" value={data.example.chinese} />
            <Row label="PY" value={data.example.pinyin} italic />
            <Row label="VI" value={data.example.vietnamese} />
          </>
        )}

        {data.note && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Ghi chú
            </Typography>
            <Typography variant="body1">{data.note}</Typography>
          </>
        )}

        {(data.audioUrl || data.chinese) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Âm thanh
            </Typography>
            {data.audioUrl ? (
              <audio controls src={data.audioUrl} style={{ width: '100%' }} />
            ) : (
              <Button variant="outlined" startIcon={<VolumeUpIcon />} onClick={() => speakChinese(data.chinese)}>
                Nghe phát âm (TTS)
              </Button>
            )}
          </>
        )}

        {(created || updated) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
              {created && (
                <Typography variant="caption">
                  Tạo: {created.toLocaleString()}
                </Typography>
              )}
              {updated && (
                <Typography variant="caption">
                  Cập nhật: {updated.toLocaleString()}
                </Typography>
              )}
            </Stack>
          </>
        )}
      </Paper>

      {/* Liên kết học nhanh nếu dùng route tương tự list */}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Link to={`/study/${data._id}`} style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="error">Học ngay</Button>
        </Link>
      </Stack>
    </Box>
  )
}
