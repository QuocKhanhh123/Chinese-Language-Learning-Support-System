import React, { useMemo, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Link } from "react-router-dom";
import { useFetchStudentVocabularies } from "../../../hooks/useFetchAllVocabularies";

const hanFontSize = (text = "") => {
  const t = String(text || "").trim();
  const len = t.length;
  if (len <= 1) return 76;
  if (len === 2) return 68;
  if (len === 3) return 60;
  if (len === 4) return 52;
  return 46;
};

const VocabularyList = () => {
  const { data: apiData, isLoading, isError } = useFetchStudentVocabularies();
  const vocabularies = useMemo(() => apiData?.data ?? [], [apiData]);

  const [difficultWords, setDifficultWords] = useState(new Set());
  const [learnedWords, setLearnedWords] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;
  const totalPages = Math.max(1, Math.ceil(vocabularies.length / itemsPerPage));

  const currentVocabularies = useMemo(() => {
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    return vocabularies.slice(indexOfFirst, indexOfLast);
  }, [vocabularies, currentPage]);

  const toggleDifficult = (id) => {
    const s = new Set(difficultWords);
    s.has(id) ? s.delete(id) : s.add(id);
    setDifficultWords(s);
  };

  const toggleLearned = (id) => {
    const s = new Set(learnedWords);
    s.has(id) ? s.delete(id) : s.add(id);
    setLearnedWords(s);
  };

  const speakChinese = (text) => {
    try {
      if (!text) return;
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const uttr = new SpeechSynthesisUtterance(text);
      uttr.lang = "zh-CN";
      uttr.rate = 0.95;
      uttr.pitch = 1;
      window.speechSynthesis.speak(uttr);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading)
    return (
      <div className="mt-10 text-center text-slate-600">
        Đang tải từ vựng HSK...
      </div>
    );
  if (isError)
    return (
      <div className="mt-10 text-center text-red-600">
        Không thể tải từ vựng
      </div>
    );

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      {/* GRID */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {currentVocabularies.map((vocab) => {
          const ex = vocab?.example || {};
          const exCN = ex.chinese || "—";
          const exPy = ex.pinyin || "—";
          const exVi = ex.vietnamese || "—";

          const han = vocab?.chinese || "—";
          const size = hanFontSize(han);

          const isBookmarked = difficultWords.has(vocab._id);
          const isLearned = learnedWords.has(vocab._id);

          return (
            <div
              key={vocab._id}
              className="h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              {/* HEADER */}
              <div className="flex min-h-[58px] items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-full border border-rose-300 px-3 py-1 text-[12px] font-extrabold tracking-wide text-rose-500">
                    {vocab.level ? `${vocab.level} · HSK` : "HSK · HSK"}
                  </span>

                  {vocab.wordType && (
                    <span className="min-w-0 rounded-full border border-slate-300 px-3 py-1 text-[12px] font-semibold text-slate-700 truncate">
                      {vocab.wordType}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleDifficult(vocab._id)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-50"
                    aria-label="bookmark"
                  >
                    {isBookmarked ? (
                      <BookmarkIcon
                        fontSize="small"
                        className="!text-rose-500"
                      />
                    ) : (
                      <BookmarkBorderIcon
                        fontSize="small"
                        className="!text-slate-400"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleLearned(vocab._id)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-50"
                    aria-label="learned"
                  >
                    <CheckCircleIcon
                      fontSize="small"
                      className={
                        isLearned ? "!text-green-500" : "!text-slate-300"
                      }
                    />
                  </button>
                </div>
              </div>

              {/* BODY: fixed height + 2 cột 50/50 cứng */}
              <div className="h-[240px] px-5 py-4">
                <div className="grid h-full grid-cols-2 gap-5">
                  {/* LEFT */}
                  <div className="grid min-w-0 grid-rows-[1fr_auto_auto] place-items-center border-r border-slate-100 pr-5">
                    {/* Han box fixed */}
                    <div className="flex h-[96px] w-full items-center justify-center overflow-hidden">
                      <Link
                        to={`/practice/vocabulary/${vocab._id}`}
                        className="max-w-full no-underline"
                      >
                        <div
                          className="max-w-[220px] truncate text-center font-black leading-none tracking-[-0.02em] text-slate-900"
                          style={{ fontSize: size }}
                          title={han}
                        >
                          {han}
                        </div>
                      </Link>
                    </div>

                    <div
                      className="mt-2 w-full max-w-[220px] truncate text-center text-[18px] font-extrabold text-rose-500"
                      title={vocab.pinyin || ""}
                    >
                      {vocab.pinyin || "—"}
                    </div>

                    <button
                      type="button"
                      onClick={() => speakChinese(vocab.chinese)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50"
                    >
                      <VolumeUpIcon
                        fontSize="small"
                        className="!text-rose-500"
                      />
                      Nghe
                    </button>
                  </div>

                  {/* RIGHT */}
                  <div className="grid min-w-0 grid-rows-[auto_auto_auto_1fr] content-start gap-3">
                    <div className="truncate text-center text-sm font-extrabold tracking-wide text-slate-500">
                      Nghĩa tiếng Việt
                    </div>

                    <div
                      className="truncate text-[28px] font-black text-slate-900"
                      title={vocab.vietnamese || ""}
                    >
                      {vocab.vietnamese || "—"}
                    </div>

                    <div className="truncate text-sm font-extrabold text-slate-500">
                      Ví dụ
                    </div>

                    <div className="grid min-w-0 content-start gap-2">
                      <div
                        className="truncate text-[15px] text-slate-900"
                        title={exCN}
                      >
                        {exCN}
                      </div>
                      <div
                        className="truncate text-sm text-slate-500"
                        title={exPy}
                      >
                        {exPy}
                      </div>
                      <div
                        className="truncate text-sm text-slate-500"
                        title={exVi}
                      >
                        {exVi}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          className="rounded-full p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          aria-label="Previous page"
        >
          <ArrowBackIosIcon />
        </button>

        <div className="pt-1 text-slate-700">
          Trang {currentPage} / {totalPages}
        </div>

        <button
          type="button"
          className="rounded-full p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          aria-label="Next page"
        >
          <ArrowForwardIosIcon />
        </button>
      </div>
    </div>
  );
};

export default VocabularyList;
