// EditFlashcard.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/network/httpRequest';
import { LoadingOverlay } from '@mantine/core';
import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import useFetchAllVocabularies from '../../hooks/useFetchAllVocabularies';
import useFetchAllGrammars from '../../hooks/useFetchAllGrammars';

function EditFlashcard() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deckTitle, setDeckTitle] = useState('');
  const [selectedItem, setSelectedItem] = useState([]);
  const [flashcardType, setFlashcardType] = useState('vocabulary'); // 'vocabulary' | 'grammar'
  const [searchTerm, setSearchTerm] = useState('');
  const [existingCardIds, setExistingCardIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // ---- FETCH VOCAB / GRAMMAR LIST ----
  const {
    data: vocabRes,
    isLoading: isLoadingVocab,
  } = useFetchAllVocabularies();

  const {
    data: grammarRes,
    isLoading: isLoadingGrammar,
  } = useFetchAllGrammars();

  // Chuẩn hoá như CreateFlashcard: API trả { success, message, data: [...], meta }
  const vocabList = useMemo(() => {
    if (Array.isArray(vocabRes)) return vocabRes;
    if (Array.isArray(vocabRes?.data)) return vocabRes.data;
    return [];
  }, [vocabRes]);

  const grammarList = useMemo(() => {
    if (Array.isArray(grammarRes)) return grammarRes;
    if (Array.isArray(grammarRes?.data)) return grammarRes.data;
    return [];
  }, [grammarRes]);

  // ---- FETCH DECK + CARDS ----
  const {
    data: deckData,
    isLoading: isLoadingDeck,
  } = useQuery({
    queryKey: ['flashcards-by-deck', deckId],
    queryFn: async () => {
      // Router: /flashcards/flashcards/deck/:deckId (mount base /flashcards)
      const res = await axiosInstance.get(
        `/flashcards/flashcards/deck/${deckId}`,
      );
      // { success, message, data: { cards, total, deck } }
      return res.data.data;
    },
    enabled: !!deckId,
  });

  // ---- INIT STATE TỪ BACKEND ----
  useEffect(() => {
    if (!deckData) return;

    // title deck
    setDeckTitle(deckData.deck?.title || '');

    // lưu danh sách id card cũ để xoá lại
    const ids = Array.isArray(deckData.cards)
      ? deckData.cards.map((c) => c._id)
      : [];
    setExistingCardIds(ids);

    // đoán type từ card đầu
    const firstCard = deckData.cards?.[0];
    if (firstCard?.type === 'vocabulary' || firstCard?.type === 'grammar') {
      setFlashcardType(firstCard.type);
    }

    // convert cards -> selectedItem để hiện bên cột "Đã chọn"
    if (Array.isArray(deckData.cards) && deckData.cards.length > 0) {
      if (firstCard?.type === 'vocabulary') {
        const items = deckData.cards
          .filter((c) => c.type === 'vocabulary' && c.vocabularyData)
          .map((c) => ({
            // dùng _id card chỉ để key / de-dupe, content lấy từ vocabularyData
            _id: c._id,
            ...c.vocabularyData,
          }));
        setSelectedItem(items);
      } else if (firstCard?.type === 'grammar') {
        const items = deckData.cards
          .filter((c) => c.type === 'grammar' && c.grammarData)
          .map((c) => ({
            _id: c._id,
            ...c.grammarData,
          }));
        setSelectedItem(items);
      } else {
        setSelectedItem([]);
      }
    } else {
      setSelectedItem([]);
    }
  }, [deckData]);

  // ---- FILTER AVAILABLE LIST ----
  const getFilteredData = () => {
    const source =
      flashcardType === 'vocabulary' ? vocabList : grammarList;

    const search = searchTerm.toLowerCase().trim();
    if (!search) return source;

    return source.filter((item) => {
      if (!item) return false;

      if (flashcardType === 'vocabulary') {
        const key = `${item.chinese || ''} ${item.pinyin || ''} ${
          item.vietnamese || ''
        }`;
        return key.toLowerCase().includes(search);
      } else {
        const key = `${item.structure || ''} ${item.title || ''} ${
          item.explanation || ''
        }`;
        return key.toLowerCase().includes(search);
      }
    });
  };

  const filteredData = getFilteredData();

  // ---- ADD / REMOVE SELECTED ----
  const addToSelected = (item) => {
    // de-dupe đơn giản theo _id
    if (!selectedItem.find((i) => i._id === item._id)) {
      setSelectedItem((prev) => [...prev, item]);
    }
  };

  const removeFromSelected = (id) => {
    setSelectedItem((prev) => prev.filter((item) => item._id !== id));
  };

  // ---- SAVE ----
  const handleSave = async () => {
    try {
      if (!deckTitle.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Thiếu tên bộ flashcard',
          text: 'Vui lòng nhập tên bộ flashcard.',
        });
        return;
      }

      if (selectedItem.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Chưa chọn mục',
          text: 'Vui lòng chọn ít nhất một mục trong bộ flashcard.',
        });
        return;
      }

      setIsSaving(true);

      // 1️⃣ Update deck title (và có thể tags nếu muốn)
      await axiosInstance.put(
        `/flashcards/decks/update/${deckId}`,
        {
          title: deckTitle.trim(),
          // description: ..., tags: [...] nếu sau này cần
        },
      );

      // 2️⃣ Xoá toàn bộ card cũ của deck
      if (existingCardIds.length) {
        await Promise.all(
          existingCardIds.map((id) =>
            axiosInstance.delete(
              `/flashcards/flashcards/delete/${id}`,
            ),
          ),
        );
      }

      // 3️⃣ Tạo lại flashcard từ selectedItem (giống CreateFlashcard)
      const createRequests = selectedItem.map((item) => {
        if (flashcardType === 'vocabulary') {
          return axiosInstance.post('/flashcards/flashcards/create', {
            deckId,
            type: 'vocabulary',
            frontText: item.chinese,
            backText: item.vietnamese,
            vocabularyData: {
              chinese: item.chinese,
              pinyin: item.pinyin ?? '',
              vietnamese: item.vietnamese,
              audioUrl: item.audioUrl ?? '',
              example: item.example ?? undefined,
              note: item.note ?? '',
              level: item.level ?? '',
              wordType: item.wordType ?? 'other',
            },
          });
        }

        // grammar
        return axiosInstance.post('/flashcards/flashcards/create', {
          deckId,
          type: 'grammar',
          frontText: item.structure,
          backText: item.explanation,
          grammarData: {
            structure: item.structure,
            explanation: item.explanation ?? '',
            examples: item.examples ?? [],
            note: item.note ?? '',
            level: item.level ?? '',
          },
        });
      });

      await Promise.all(createRequests);

      Swal.fire({
        icon: 'success',
        title: 'Cập nhật thành công!',
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(-1);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text:
          err?.response?.data?.message ||
          'Cập nhật thất bại, vui lòng thử lại.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingDeck || isLoadingVocab || isLoadingGrammar || isSaving;

  return (
    <div className="p-6">
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-bold">Chỉnh sửa Flashcard</h1>
      </div>

      {/* Tên bộ flashcard */}
      <div className="mb-6">
        <label className="block text-sm mb-2 mt-2 font-medium text-gray-700">
          Tên bộ flashcard
        </label>
        <input
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          className="w-full p-3 border rounded"
          placeholder="Nhập tên bộ flashcard"
        />
      </div>

      {/* Chọn loại */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => {
            setFlashcardType('vocabulary');
            setSelectedItem([]); // nếu muốn reset khi đổi type
          }}
          className={`px-4 py-2 rounded ${
            flashcardType === 'vocabulary'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100'
          }`}
        >
          Từ vựng
        </button>
        <button
          onClick={() => {
            setFlashcardType('grammar');
            setSelectedItem([]);
          }}
          className={`px-4 py-2 rounded ${
            flashcardType === 'grammar'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100'
          }`}
        >
          Ngữ pháp
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full p-3 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 2 cột: available + selected */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* AVAILABLE */}
        <div>
          <h2 className="font-medium mb-2">Danh sách mục có sẵn</h2>
          <div className="border rounded p-2 h-[300px] overflow-y-auto">
            {filteredData.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center py-2 border-b"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {flashcardType === 'vocabulary'
                      ? item.chinese
                      : item.structure || item.title}
                    {item.level && (
                      <span className="text-gray-500"> ({item.level})</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">
                    {flashcardType === 'vocabulary'
                      ? item.vietnamese
                      : (item.explanation || '').slice(0, 60) +
                        (item.explanation?.length > 60 ? '...' : '')}
                  </span>
                </div>
                <button
                  onClick={() => addToSelected(item)}
                  className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  <AddIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SELECTED */}
        <div>
          <h2 className="font-medium mb-2">
            Đã chọn ({selectedItem.length})
          </h2>
          <div className="border rounded p-2 h-[300px] overflow-y-auto">
            {selectedItem.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center py-2 border-b"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {flashcardType === 'vocabulary'
                      ? item.chinese
                      : item.structure || item.title}
                    {item.level && (
                      <span className="text-gray-500"> ({item.level})</span>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">
                    {flashcardType === 'vocabulary'
                      ? item.vietnamese
                      : (item.explanation || '').slice(0, 60) +
                        (item.explanation?.length > 60 ? '...' : '')}
                  </span>
                </div>
                <button
                  onClick={() => removeFromSelected(item._id)}
                  className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700"
                >
                  <DeleteIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SAVE */}
      <button
        onClick={handleSave}
        className="w-full py-3 rounded text-white bg-red-600 hover:bg-red-700"
      >
        Lưu cập nhật
      </button>
    </div>
  );
}

export default EditFlashcard;