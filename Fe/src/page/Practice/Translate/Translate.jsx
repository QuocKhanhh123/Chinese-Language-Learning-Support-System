import axiosInstance from '@/network/httpRequest'
import { useState, useEffect } from 'react'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import SearchIcon from '@mui/icons-material/Search'
import TranslateIcon from '@mui/icons-material/Translate'
import MenuBookIcon from '@mui/icons-material/MenuBook'

export default function TranslateChinese() {
  const [text, setText] = useState('')
  const [translateResult, setTranslateResult] = useState(null)
  const [dictionaryResult, setDictionaryResult] = useState(null)
  const [loading, setLoading] = useState(false)

  /* =====================
   * RESET KHI XOÁ TEXT
   * ===================== */
  useEffect(() => {
    if (!text.trim()) {
      setTranslateResult(null)
      setDictionaryResult(null)
    }
  }, [text])

  /* =====================
   * TRANSLATE
   * ===================== */
  const handleTranslate = async () => {
    if (!text.trim() || loading) return

    try {
      setLoading(true)

      // === TRANSLATE VI → ZH (API BE)
      const res = await axiosInstance.post(
        '/language/translate/vi-to-zh',
        { text }
      )

      const sentences = res?.data?.data?.sentences || []

      // ✅ NORMALIZE DATA (QUAN TRỌNG)
      setTranslateResult({
        chinese: sentences[0]?.trans ?? '',
        pinyin: sentences[1]?.translit ?? '',
      })

      // === DICTIONARY (OPTIONAL / MOCK / DB SAU)
      const dictRes = await axiosInstance.post(
        '/language/dictionary/lookup',
        { text }
      )

      setDictionaryResult(
        dictRes?.data?.data?.tratu?.[0]?.fields || null
      )
    } catch (err) {
      console.error('❌ Translate API error:', err)
      setTranslateResult(null)
      setDictionaryResult(null)
    } finally {
      setLoading(false)
    }
  }

  /* =====================
   * SPEAK
   * ===================== */
  const speakChinese = (value) => {
    if (!value) return
    const utterance = new SpeechSynthesisUtterance(value)
    utterance.lang = 'zh-CN'
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ================= INPUT ================= */}
        <div className="bg-white rounded-xl shadow p-6 border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
            <SearchIcon /> Nhập từ / câu tiếng Việt
          </h2>

          <textarea
            placeholder={`Nhập tiếng Việt muốn dịch sang tiếng Trung…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleTranslate()
              }
            }}
            disabled={loading}
            className="w-full h-32 p-4 border border-red-300 rounded-lg resize-none
                       focus:outline-none focus:ring-2 focus:ring-red-400
                       disabled:bg-gray-100"
          />

          <div className="text-xs text-gray-400 mt-2">
            ⌨️ Enter để dịch · Shift + Enter để xuống dòng
          </div>
        </div>

        {/* ================= RESULT ================= */}
        <div className="bg-white rounded-xl shadow p-6 border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
            <TranslateIcon /> Kết quả tiếng Trung
          </h2>

          {loading && (
            <p className="text-gray-400">Đang dịch…</p>
          )}

          {!loading && translateResult?.chinese ? (
            <div className="space-y-4">
              {/* 汉字 */}
              <div className="flex items-center gap-2 flex-wrap">
                <p>
                  <strong className="text-gray-600">Tiếng Trung:</strong>{' '}
                  <span className="text-red-600 text-lg">
                    {translateResult.chinese}
                  </span>
                </p>
                <RecordVoiceOverIcon
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                  onClick={() =>
                    speakChinese(translateResult.chinese)
                  }
                />
              </div>

              {/* PINYIN */}
              {translateResult.pinyin && (
                <div className="flex items-center gap-2 flex-wrap">
                  <p>
                    <strong className="text-gray-600">
                      Phiên âm (pinyin):
                    </strong>{' '}
                    <span className="text-red-500 italic">
                      {translateResult.pinyin}
                    </span>
                  </p>
                  <RecordVoiceOverIcon
                    className="text-red-400 hover:text-red-600 cursor-pointer"
                    onClick={() =>
                      speakChinese(translateResult.pinyin)
                    }
                  />
                </div>
              )}
            </div>
          ) : (
            !loading && (
              <p className="text-gray-400">
                Chưa có kết quả dịch…
              </p>
            )
          )}

          {/* ================= DICTIONARY ================= */}
          {dictionaryResult && (
            <div className="mt-6">
              <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <MenuBookIcon /> Từ điển
              </h3>
              <p className="text-base text-gray-800 mb-2">
                <strong>Từ:</strong> {dictionaryResult.word}
              </p>
              <div
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: dictionaryResult.fulltext,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}