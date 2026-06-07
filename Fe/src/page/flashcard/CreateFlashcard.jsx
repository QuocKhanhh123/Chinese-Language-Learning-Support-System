import useFetchAllGrammars from "@/hooks/useFetchAllGrammars";
import useFetchAllVocabularies from "@/hooks/useFetchAllVocabularies";
import axiosInstance from "@/network/httpRequest";
import { LoadingOverlay } from "@mantine/core";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BookIcon from "@mui/icons-material/Book";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateFlashcard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [view, setView] = useState("create");
  const [flashcardType, setFlashcardType] = useState("vocabulary");
  const [isSaving, setIsSaving] = useState(false);

  // ---- FETCH DATA ----
  const {
    data: vocabRes,
    isLoading: isLoadingVocab,
  } = useFetchAllVocabularies();

  const {
    data: grammarRes,
    isLoading: isLoadingGrammar,
  } = useFetchAllGrammars();

  // Chuẩn hoá thành array: API dạng { success, message, data: [...], meta }
  const vocabList = Array.isArray(vocabRes)
    ? vocabRes
    : Array.isArray(vocabRes?.data)
    ? vocabRes.data
    : [];

  const grammarList = Array.isArray(grammarRes)
    ? grammarRes
    : Array.isArray(grammarRes?.data)
    ? grammarRes.data
    : [];

  const baseList =
    flashcardType === "vocabulary" ? vocabList : grammarList;

  // ---- FILTER SEARCH ----
  const filteredData = baseList.filter((item) => {
    const str = JSON.stringify(item || {}).toLowerCase();
    return str.includes(searchTerm.toLowerCase());
  });

  // ---- SELECT / UNSELECT ----
  const addToSelected = (item) => {
    if (!selectedItem.find((s) => s._id === item._id)) {
      setSelectedItem((prev) => [...prev, item]);
    }
  };

  const removeFromSelected = (id) =>
    setSelectedItem((prev) => prev.filter((i) => i._id !== id));

  // ---- CREATE PREVIEW FLASHCARDS ----
  const createFlashcards = () => {
    if (!deckName.trim() || selectedItem.length === 0) return;

    let newCards = [];

    if (flashcardType === "vocabulary") {
      newCards = selectedItem.map((v) => ({
        id: v._id,
        // Mặt trước: Hán tự + pinyin
        front: {
          text: v.chinese, // chữ Hán
          subtext: v.pinyin, // pinyin
        },
        // Mặt sau: nghĩa Việt + ví dụ (nếu có)
        back: {
          text: v.vietnamese || "", // nghĩa tiếng Việt chính
          example: v.example?.chinese ?? "",
          translation:
            v.example?.vietnamese ??
            "", // giải thích Việt cho ví dụ (nếu API có)
        },
      }));
    } else {
      newCards = selectedItem.map((g) => ({
        id: g._id,
        // Mặt trước: cấu trúc + level
        front: {
          text: g.structure || g.title || "",
          subtext: g.level || "",
        },
        // Mặt sau: giải thích + ví dụ
        back: {
          text: g.explanation || "", // giải thích VN/EN tuỳ backend
          example: g.examples?.[0]?.chinese ?? "",
          translation: g.examples?.[0]?.vietnamese ?? "",
        },
      }));
    }

    setFlashcards(newCards);
    setView("preview");
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // ---- NEXT / PREV ----
  const nextCard = () => {
    setCurrentCardIndex((idx) => {
      const next = idx + 1;
      if (next >= flashcards.length) return idx;
      return next;
    });
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((idx) => {
      const prev = idx - 1;
      if (prev < 0) return idx;
      return prev;
    });
    setIsFlipped(false);
  };

  // ---- SAVE FLASHCARDS ----
  const handleSaveFlashCard = async () => {
    try {
      if (!deckName.trim() || selectedItem.length === 0) {
        alert("Vui lòng nhập tên bộ thẻ và chọn ít nhất 1 mục!");
        return;
      }

      setIsSaving(true);

      // 1️⃣ Tạo deck
      const deckRes = await axiosInstance.post("/flashcards/decks/create", {
        title: deckName.trim(),
        description: `Bộ flashcard ${
          flashcardType === "vocabulary" ? "từ vựng" : "ngữ pháp"
        }`,
        tags: [flashcardType],
      });
      const deckId = deckRes?.data?.data?._id;
      if (!deckId) throw new Error("Không tạo được deck.");

      // 2️⃣ Tạo flashcards
      const requests = selectedItem.map((item) => {
        if (flashcardType === "vocabulary") {
          return axiosInstance.post("/flashcards/flashcards/create", {
            deckId,
            type: "vocabulary",
            frontText: item.chinese,
            backText: item.vietnamese,
            vocabularyData: {
              chinese: item.chinese,
              ...(item.pinyin ? { pinyin: item.pinyin } : {}),
              vietnamese: item.vietnamese,
              ...(item.audioUrl ? { audioUrl: item.audioUrl } : {}),
              ...(item.note ? { note: item.note } : {}),
              ...(item.level ? { level: item.level } : {}),
              ...(item.wordType ? { wordType: item.wordType } : {}),
            },
          });
        } else {
          return axiosInstance.post("/flashcards/flashcards/create", {
            deckId,
            type: "grammar",
            frontText: item.structure,
            backText: item.explanation,
            grammarData: {
              structure: item.structure,
              ...(item.explanation ? { explanation: item.explanation } : {}),
              ...(item.note ? { note: item.note } : {}),
              ...(item.level ? { level: item.level } : {}),
            },
          });
        }
      });

      await Promise.all(requests);
      alert("Tạo flashcards thành công!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message ?? "Lỗi khi lưu flashcards!");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingVocab || isLoadingGrammar || isSaving;

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="w-full min-h-screen bg-gray-50 relative">
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      <div className="w-full max-w-[1440px] mx-auto px-4 py-6">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="bg-red-600 text-white p-4 rounded-t-lg">
            <h1 className="text-xl font-bold">Tạo Flashcards</h1>
          </div>

          {/* ----- VIEW CREATE ----- */}
          {view === "create" && (
            <div className="p-6">
              {/* chọn loại flashcard */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setFlashcardType("vocabulary")}
                  className={`flex items-center px-6 py-2.5 rounded-lg ${
                    flashcardType === "vocabulary"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <BookIcon className="h-5 w-5 mr-2" /> Từ vựng
                </button>
                <button
                  onClick={() => setFlashcardType("grammar")}
                  className={`flex items-center px-6 py-2.5 rounded-lg ${
                    flashcardType === "grammar"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ChatBubbleIcon className="h-5 w-5 mr-2" /> Ngữ pháp
                </button>
              </div>

              {/* tên bộ thẻ */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bộ thẻ
                </label>
                <input
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Nhập tên bộ flashcard"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500"
                />
              </div>

              {/* search */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Tìm kiếm ${
                    flashcardType === "vocabulary" ? "từ vựng" : "ngữ pháp"
                  }`}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:border-red-500"
                />
              </div>

              {/* 2 cột: available + selected */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Available */}
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-gray-50 font-medium">
                    {flashcardType === "vocabulary"
                      ? "Từ vựng có sẵn"
                      : "Ngữ pháp có sẵn"}
                  </div>
                  <div className="max-h-[600px] overflow-y-auto divide-y">
                    {filteredData.length ? (
                      filteredData.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between p-4 hover:bg-gray-50"
                        >
                          <div>
                            <div className="font-medium">
                              {flashcardType === "vocabulary"
                                ? item.chinese
                                : item.structure || item.title}{" "}
                              {item.level && (
                                <span className="text-gray-500">
                                  {" "}
                                  ({item.level})
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {flashcardType === "vocabulary"
                                ? item.vietnamese
                                : (item.explanation || "").slice(0, 60) +
                                  (item.explanation?.length > 60
                                    ? "..."
                                    : "")}
                            </div>
                          </div>
                          <button
                            onClick={() => addToSelected(item)}
                            className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700"
                          >
                            <AddIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Không tìm thấy kết quả
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected */}
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-gray-50 font-medium">
                    {flashcardType === "vocabulary"
                      ? "Từ vựng đã chọn"
                      : "Ngữ pháp đã chọn"}{" "}
                    ({selectedItem.length})
                  </div>
                  <div className="max-h-[600px] overflow-y-auto divide-y">
                    {selectedItem.length ? (
                      selectedItem.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between p-4 hover:bg-gray-50"
                        >
                          <div>
                            <div className="font-medium">
                              {flashcardType === "vocabulary"
                                ? item.chinese
                                : item.structure || item.title}{" "}
                              {item.level && (
                                <span className="text-gray-500">
                                  {" "}
                                  ({item.level})
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {flashcardType === "vocabulary"
                                ? item.vietnamese
                                : (item.explanation || "").slice(0, 60) +
                                  (item.explanation?.length > 60
                                    ? "..."
                                    : "")}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromSelected(item._id)}
                            className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700"
                          >
                            <CloseIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Chưa chọn mục nào
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* nút tạo preview */}
              <div className="mt-6">
                <button
                  onClick={createFlashcards}
                  disabled={!deckName.trim() || selectedItem.length === 0}
                  className={`w-full ${
                    !deckName.trim() || selectedItem.length === 0
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  } py-3 rounded-lg font-medium`}
                >
                  Tạo Flashcards
                </button>
              </div>
            </div>
          )}

          {/* ----- VIEW PREVIEW ----- */}
          {view === "preview" && (
            <div className="p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {deckName} ({currentCardIndex + 1}/{flashcards.length})
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setView("create")}
                    className="px-4 py-2 bg-gray-100 rounded-lg"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleSaveFlashCard}
                    disabled={isSaving}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>

              {flashcards.length > 0 && currentCard && (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  {/* CARD */}
                  <div
                    className="card-container"
                    onClick={() => setIsFlipped((f) => !f)}
                  >
                    <div
                      className={`card-inner ${
                        isFlipped ? "is-flipped" : ""
                      }`}
                    >
                      {/* FRONT */}
                      <div className="card-face card-front bg-red-600 text-white flex flex-col justify-center items-center rounded-xl shadow-lg p-8">
                        <div className="text-4xl font-bold mb-4 text-center">
                          {currentCard.front.text}
                        </div>
                        {currentCard.front.subtext && (
                          <div className="text-xl opacity-80 text-center">
                            {currentCard.front.subtext}
                          </div>
                        )}
                      </div>

                      {/* BACK */}
                      <div className="card-face card-back bg-white text-gray-800 flex flex-col justify-center items-center rounded-xl shadow-lg p-8">
                        {currentCard.back.text && (
                          <div className="text-2xl font-bold mb-3 text-center">
                            {currentCard.back.text}
                          </div>
                        )}

                        {(currentCard.back.example ||
                          currentCard.back.translation) && (
                          <>
                            {currentCard.back.example && (
                              <div className="text-lg italic text-gray-600 text-center">
                                {currentCard.back.example}
                              </div>
                            )}
                            {currentCard.back.translation && (
                              <div className="text-gray-500 mt-2 text-center">
                                {currentCard.back.translation}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* NAV BUTTONS */}
                  <div className="flex space-x-6 mt-8">
                    <button
                      onClick={prevCard}
                      disabled={currentCardIndex === 0}
                      className={`p-3 rounded-full ${
                        currentCardIndex === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      <ArrowBackIcon />
                    </button>
                    <button
                      onClick={nextCard}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className={`p-3 rounded-full ${
                        currentCardIndex === flashcards.length - 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      <ArrowForwardIcon />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS flip 3D chuẩn – tránh chữ bị ngược */}
      <style>{`
        .card-container {
          position: relative;
          width: 500px;
          height: 300px;
          cursor: pointer;
          perspective: 1000px;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.5s;
          transform-style: preserve-3d;
        }

        .card-inner.is-flipped {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
        }

        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default CreateFlashcard;