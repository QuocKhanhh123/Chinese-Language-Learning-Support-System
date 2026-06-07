import useFetchAllDecks from '@/hooks/useFetchAllDecks'
import { LoadingOverlay, Button } from '@mantine/core'
import { Book, PlayArrow } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

const HSK_LEVELS = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']

function Deck() {
  const { data, isLoading } = useFetchAllDecks()
  const [activeLevel, setActiveLevel] = useState(null)

  // Chuẩn hoá mảng decks từ nhiều kiểu trả về
  const rawDecks =
    (data && data.decks) ||
    (data && data.data && data.data.decks) ||
    data ||
    []

  const decks = Array.isArray(rawDecks) ? rawDecks : []

  // Filter theo HSK level (dựa trên tags)
  const filteredDecks = useMemo(() => {
    if (!activeLevel) return decks
    return decks.filter(
      (d) => Array.isArray(d.tags) && d.tags.includes(activeLevel)
    )
  }, [decks, activeLevel])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      {/* Header HSK */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bộ flashcard HSK
          </h1>
          <p className="text-gray-500 mt-1">
            Luyện từ vựng & ngữ pháp theo cấp độ HSK, học lặp lại nhiều lần để
            ghi nhớ lâu.
          </p>
        </div>

        {/* Filter HSK level */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveLevel(null)}
            className={
              'px-3 py-1 rounded-full text-sm border transition ' +
              (!activeLevel
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:border-red-400')
            }
          >
            Tất cả
          </button>
          {HSK_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActiveLevel(level)}
              className={
                'px-3 py-1 rounded-full text-sm border transition ' +
                (activeLevel === level
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-red-400')
              }
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Decks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDecks.map((deck) => {
          const cardCount =
            (deck.stat && (deck.stat.flashCardCount || deck.stat.totalCards)) ||
            0
          const hskTag =
            Array.isArray(deck.tags) &&
            deck.tags.find((t) => typeof t === 'string' && t.startsWith('HSK'))

          return (
            <Link
              key={deck._id}
              to={`${deck._id}`}
              aria-label={`Đi đến bộ flashcard ${deck.title}`}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 hover:scale-[1.03] border border-gray-200 hover:border-red-600 p-6 flex flex-col justify-between h-full">
                {/* Title + icon */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                    <Book fontSize="large" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {deck.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                     Người tạo:{' '}
                      <span className="font-medium text-gray-700">
                        {deck.createdBy && deck.createdBy.name
                          ? deck.createdBy.name
                          : 'Teacher'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Tags / HSK level */}
                {Array.isArray(deck.tags) && deck.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {deck.tags.map((tag) => (
                      <span
                        key={tag}
                        className={
                          'px-2 py-1 rounded-full text-[11px] font-medium border ' +
                          (tag === hskTag
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200')
                        }
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {deck.description ||
                    'Luyện tập flashcard tiếng Trung theo chủ đề và cấp độ.'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-red-600 text-sm font-medium mt-auto">
                  <span>
                    {/* {cardCount} thẻ */}
                    {hskTag && (
                      <span className="ml-1 text-gray-500 text-xs">
                        ({hskTag})
                      </span>
                    )}
                  </span>
                  <Button
                    component="span"
                    variant="outlined"
                    color="error"
                    size="small"
                    className="flex items-center gap-1 font-semibold "
                  >
                    Học ngay <PlayArrow fontSize="small" />
                  </Button>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Empty State */}
      {Array.isArray(decks) && decks.length === 0 && !isLoading && (
        <div className="text-center py-20">
          <Book className="mx-auto text-gray-300 mb-6" sx={{ fontSize: 64 }} />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Chưa có bộ flashcard nào
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Hãy quay lại sau hoặc hỏi giáo viên để được chia sẻ bộ flashcard
            HSK nhé.
          </p>
        </div>
      )}
    </div>
  )
}

export default Deck