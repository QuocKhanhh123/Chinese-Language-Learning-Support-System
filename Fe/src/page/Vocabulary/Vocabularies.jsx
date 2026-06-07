import axiosInstance from '@/network/httpRequest'
import { LoadingOverlay } from '@mantine/core'
import { Add, Book, Delete, PlayArrow, Search } from '@mui/icons-material'
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

// =========================
// HSK FILTER OPTIONS
// =========================
const LEVELS = ["ALL", "HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"];

function Vocabularies() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  const [level, setLevel] = useState("");         // 👈 FILTER BY LEVEL
  const [searchTerm, setSearchTerm] = useState("");
  const [vocabularies, setVocabularies] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // =========================
  // LOAD DATA (first page)
  // =========================
  useEffect(() => {
    fetchPage(1, true);
  }, [level]);

  const fetchPage = async (targetPage = 1, reset = false) => {
    setIsLoading(true);
    try {
      const url = `/vocabularies/my-vocabularies?page=${targetPage}&limit=${limit}&level=${level}`;
      const res = await axiosInstance.get(url);

      const data = res?.data?.data ?? [];
      const m = res?.data?.meta;

      if (reset) setVocabularies(data);
      else setVocabularies(prev => [...prev, ...data]);

      if (m) setMeta(m);
      setPage(targetPage);
    } catch (err) {
      console.error("Fetch vocab error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // LOAD MORE
  // =========================
  const showMore = async () => {
    if (page >= meta.totalPages) return;

    setIsLoadingMore(true);
    try {
      await fetchPage(page + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // =========================
  // CLIENT SEARCH
  // =========================
  const filteredVocabularies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return vocabularies;

    return vocabularies.filter(v =>
      (v.chinese ?? '').toLowerCase().includes(q) ||
      (v.pinyin ?? '').toLowerCase().includes(q) ||
      (v.vietnamese ?? '').toLowerCase().includes(q)
    );
  }, [searchTerm, vocabularies]);

  const hasMore = page < (meta?.totalPages || 1);

  // =========================
  // DELETE VOCAB
  // =========================
  const handleDeleteVocab = async (vocabularyId) => {
    const confirm = await Swal.fire({
      title: "Xóa từ vựng?",
      text: "Hành động này sẽ xóa từ vựng này.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosInstance.delete(`/vocabularies/delete/${vocabularyId}`);

      setVocabularies(prev => prev.filter(v => v._id !== vocabularyId));

      Swal.fire("Đã xóa!", "", "success");
    } catch (err) {
      Swal.fire("Lỗi!", err?.response?.data?.message || "Không thể xóa.", "error");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-7xl mx-auto p-6">
      <LoadingOverlay visible={isLoading} overlayBlur={3} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        
        {/* Search */}
        <div className="relative w-full md:w-1/2 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-red-500" fontSize="medium" />
          </div>
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm (汉字 / pinyin / nghĩa Việt)…"
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 
                       focus:border-red-500 focus:ring-2 focus:ring-red-300 text-lg"
          />
        </div>

        {/* Add Button */}
        <Link
          to="create-vocab"
          className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 
                     rounded-full font-semibold shadow-lg hover:bg-red-700 text-lg"
        >
          <Add fontSize="medium" /> Tạo từ vựng
        </Link>
      </div>

      {/* HSK FILTER */}
      <div className="flex flex-wrap gap-3 mb-8">
        {LEVELS.map(l => {
          const val = l === "ALL" ? "" : l;
          const active = val === level;

          return (
            <button
              key={l}
              onClick={() => setLevel(val)}
              className={`
                px-4 py-2 rounded-full border transition
                ${active 
                  ? "bg-red-600 text-white border-red-600" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}
              `}
            >
              {l}
            </button>
          );
        })}
      </div>

      <hr className="border-gray-300 mb-8" />

      {/* GRID LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredVocabularies.length > 0 ? filteredVocabularies.map(vocab => (
          <div
            key={vocab._id}
            className="flex flex-col p-4 bg-white rounded-lg shadow-md 
                       hover:shadow-xl border hover:border-red-500 transition"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-md shadow-inner">
                  <Book />
                </div>
                <h3 className="font-semibold text-lg truncate">
                  {vocab.chinese} 
                  <span className="font-normal text-gray-700"> — {vocab.vietnamese}</span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                {vocab.pinyin && <span className="italic">{vocab.pinyin}</span>}
                {vocab.level && (
                  <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                    {vocab.level}
                  </span>
                )}
                {vocab.wordType && (
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                    {vocab.wordType}
                  </span>
                )}
              </div>

              {vocab.example?.chinese && (
                <div className="mt-3 text-sm">
                  <div className="font-medium">{vocab.example.chinese}</div>
                  {vocab.example.pinyin && <div className="italic text-gray-500">{vocab.example.pinyin}</div>}
                  {vocab.example.vietnamese && <div className="text-gray-600">{vocab.example.vietnamese}</div>}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-4">
              <Link to={`study/${vocab._id}`} className="text-red-600 hover:bg-red-50 p-2 rounded">
                <PlayArrow />
              </Link>

              <button
                onClick={() => handleDeleteVocab(vocab._id)}
                className="text-gray-400 hover:bg-red-50 hover:text-red-600 p-2 rounded"
              >
                <Delete />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center col-span-full py-16 text-gray-500">
            Không tìm thấy từ vựng phù hợp
          </div>
        )}
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <button
          onClick={showMore}
          disabled={isLoadingMore}
          className="mt-8 mx-auto px-8 py-3 bg-red-600 text-white rounded-full font-semibold"
        >
          {isLoadingMore ? "Đang tải…" : "Xem thêm"}
        </button>
      )}
    </div>
  );
}

export default Vocabularies;