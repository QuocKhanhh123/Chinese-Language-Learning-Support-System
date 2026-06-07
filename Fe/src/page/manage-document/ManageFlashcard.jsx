import {
    Box,
    Button,
    Typography,
    IconButton,
    Avatar,
    TextField,
    Chip,
    Skeleton,
    InputAdornment,
  } from '@mui/material'
  import { Add, Book, Delete, Edit, PlayArrow, Search } from '@mui/icons-material'
  import { Link } from 'react-router-dom'
  import Swal from 'sweetalert2'
  import useFetchAllDecks from '@/hooks/useFetchAllDecks'
  import useAuthStore from '@/store/useAuthStore'
  import { useMemo, useState } from 'react'
  import axiosInstance from '@/network/httpRequest'
  import { useQueryClient } from '@tanstack/react-query'
  
  function ManageFlashcard() {
    const { user } = useAuthStore()
    const [visibleItems, setVisibleItems] = useState(6)
    const [searchTerm, setSearchTerm] = useState('')
    const { data, isLoading } = useFetchAllDecks()
    const decks = data?.decks ?? []
    const queryClient = useQueryClient()
  
    const currentUserId = user?.id ?? user?._id
  
    const handleDeleteDeck = async (deckId) => {
      const confirm = await Swal.fire({
        title: 'Xóa bộ flashcard?',
        text: 'Hành động này sẽ xóa toàn bộ thẻ trong bộ này. Bạn chắc chứ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
      })
  
      if (confirm.isConfirmed) {
        try {
          await axiosInstance.delete(`/flashcards/decks/delete/${deckId}`)
          await queryClient.invalidateQueries({ queryKey: ['decks'] })
          Swal.fire('Đã xóa!', 'Bộ flashcard đã được xóa.', 'success')
        } catch (error) {
          Swal.fire(
            'Lỗi!',
            error?.response?.data?.message || 'Không thể xóa bộ flashcard',
            'error'
          )
        }
      }
    }
  
    const showMore = () => setVisibleItems((prev) => prev + 6)
  
    const filteredDecks = useMemo(
      () =>
        decks.filter((deck) =>
          (deck.title ?? '').toLowerCase().includes(searchTerm.toLowerCase())
        ),
      [decks, searchTerm]
    )
  
    const visibleDecks = filteredDecks.slice(0, visibleItems)
    const hasMore = filteredDecks.length > visibleItems
  
    const skeletons = Array.from({ length: 6 })
  
    return (
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
          userSelect: 'none',
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          mb={4}
        >
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'error.main',
              letterSpacing: 0.5,
            }}
          >
            🀄️ Bộ thẻ HSK / Flashcards
          </Typography>
  
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Tìm kiếm theo tiêu đề (VD: HSK1, lời chào...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: { xs: '100%', sm: 320 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '9999px',
                  '&.Mui-focused fieldset': {
                    borderColor: 'error.main',
                    boxShadow: '0 0 8px rgba(244, 67, 54, 0.25)',
                  },
                },
              }}
              inputProps={{ 'aria-label': 'Tìm kiếm flashcards' }}
            />
  
            <Button
              component={Link}
              to="create-flashcard"
              variant="contained"
              color="error"
              startIcon={<Add />}
              size="medium"
              sx={{
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Tạo flashcards
            </Button>
          </Box>
        </Box>
  
        {/* Grid */}
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          }}
          gap={3}
        >
          {isLoading
            ? skeletons.map((_, i) => (
                <Box
                  key={`s-${i}`}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    p: 3,
                    boxShadow: 2,
                  }}
                >
                  <Skeleton variant="circular" width={56} height={56} />
                  <Skeleton sx={{ mt: 2 }} width="80%" />
                  <Skeleton width="60%" />
                  <Skeleton sx={{ mt: 2 }} height={120} />
                </Box>
              ))
            : visibleDecks.length > 0
            ? visibleDecks.map((deck) => {
                const flashCount = deck?.stat?.flashCardCount ?? 0
                const owner = deck?.createdBy ?? {}
                const ownerName = owner?.name || owner?.email || 'Giáo viên'
                const ownerId = owner?._id
                const isOwner = ownerId && currentUserId && ownerId === currentUserId
  
                const tags = Array.isArray(deck.tags) ? deck.tags : []
                const hskTag =
                  tags.find((t) => /^hsk\d+/i.test(t)) ||
                  (deck.title?.match(/hsk\s*\d/i)?.[0] ?? '')
  
                return (
                  <Box
                    key={deck._id}
                    sx={{
                      position: 'relative',
                      bgcolor: 'background.paper',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'rgba(244, 67, 54, 0.15)',
                      boxShadow: 3,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 260,
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-6px)',
                        borderColor: 'error.light',
                      },
                      backgroundImage:
                        'radial-gradient(12px 12px at 12px 12px, rgba(244,67,54,0.06) 20%, transparent 21%)',
                      backgroundSize: '24px 24px',
                    }}
                  >
                    {/* Header icon + title */}
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          bgcolor: 'error.light',
                          color: 'error.main',
                          p: 1.5,
                          borderRadius: '16px',
                          boxShadow: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Book />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          color="text.primary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.25,
                          }}
                          title={deck.title}
                        >
                          {deck.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {/* {flashCount} thuật ngữ */}
                        </Typography>
                      </Box>
  
                      {hskTag ? (
                        <Chip
                          label={String(hskTag).toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: 'rgba(255,193,7,0.15)',
                            color: '#c68a00',
                            border: '1px solid rgba(255,193,7,0.35)',
                          }}
                        />
                      ) : null}
                    </Box>
  
                    {/* Owner */}
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                      sx={{ mt: 2 }}
                    >
                      <Avatar
                        src={owner?.avatar}
                        alt={ownerName}
                        sx={{
                          width: 36,
                          height: 36,
                          border: '2px solid',
                          borderColor: 'grey.200',
                        }}
                      >
                        {(ownerName || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" color="text.primary" fontWeight={600} noWrap>
                        {ownerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        • Giáo viên tiếng Trung
                      </Typography>
                    </Box>
  
                    {/* Actions */}
                    <Box sx={{ mt: 'auto' }} />
  
                    <Box
                      display="flex"
                      justifyContent="center"
                      gap={1.5}
                      sx={{ mt: 2 }}
                    >
                      <Link
                        to={`study/${deck._id}`}
                        title="Học ngay"
                        className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors shadow-sm hover:shadow-md"
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <PlayArrow />
                      </Link>
  
                      {isOwner && (
                        <>
                          <Link
                            to={`edit/${deck._id}`}
                            title="Chỉnh sửa"
                            className="text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition-colors shadow-sm hover:shadow-md"
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <Edit />
                          </Link>
  
                          <IconButton
                            aria-label="Xóa bộ flashcard"
                            title="Xóa"
                            onClick={() => handleDeleteDeck(deck._id)}
                            sx={{
                              color: 'gray',
                              '&:hover': {
                                color: 'error.main',
                                bgcolor: 'error.light',
                              },
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>
                )
              }) : (
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
                py={8}
                gridColumn="1 / -1"
              >
                Không tìm thấy bộ flashcard nào phù hợp với từ khóa “{searchTerm}”.
              </Typography>
            )}
        </Box>
  
        {/* Show More */}
        {!isLoading && hasMore && (
          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              color="error"
              onClick={showMore}
              sx={{ fontWeight: 800, px: 5, borderRadius: '9999px', textTransform: 'none' }}
            >
              Xem thêm
            </Button>
          </Box>
        )}
  
        {/* Empty state */}
        {!isLoading && decks.length === 0 && (
          <Box textAlign="center" py={10}>
            <Book sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" mb={1}>
              Chưa có bộ flashcard nào
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Tạo bộ đầu tiên để bắt đầu hành trình HSK của bạn!
            </Typography>
            <Button
              component={Link}
              to="create-flashcard"
              variant="contained"
              color="error"
              size="large"
              startIcon={<Add />}
              sx={{ borderRadius: '9999px', textTransform: 'none', fontWeight: 800 }}
            >
              Tạo flashcards
            </Button>
          </Box>
        )}
      </Box>
    )
  }
  
  export default ManageFlashcard
  