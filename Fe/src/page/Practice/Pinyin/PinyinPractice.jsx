import { useEffect, useState } from "react";
import axiosInstance from "@/network/httpRequest";
import { useParams } from "react-router-dom";

// ------------------ Pinyin tone function ------------------
const vowels = ["a", "o", "e", "i", "u", "ü"];
const toneMap = {
  a: ["ā", "á", "ǎ", "à"],
  o: ["ō", "ó", "ǒ", "ò"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

function convertTone(word) {
  const match = word.match(/([a-zü]+)([1-5])$/i);
  if (!match) return word;
  let [_, s, tone] = match;
  tone = Number(tone);
  if (tone === 5) return s;

  let vowelIndex = -1;
  if (s.includes("a")) vowelIndex = s.indexOf("a");
  else if (s.includes("e")) vowelIndex = s.indexOf("e");
  else if (s.includes("ou")) vowelIndex = s.indexOf("o");
  else {
    for (let v of vowels) {
      const idx = s.indexOf(v);
      if (idx !== -1) {
        vowelIndex = idx;
        break;
      }
    }
  }

  if (vowelIndex === -1) return s;
  const vowel = s[vowelIndex];
  const replaced = toneMap[vowel][tone - 1];
  return s.slice(0, vowelIndex) + replaced + s.slice(vowelIndex + 1);
}

// ------------------ MAIN COMPONENT ------------------
export default function PinyinPractice() {
  const { level } = useParams();

  const [list, setList] = useState([]);
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Load vocab
  useEffect(() => {
    axiosInstance
      .get(`/vocabularies/student/list?level=${level}&limit=500`)
      .then((res) => {
        const data = res.data?.data || [];
        setList(data);
        if (data.length > 0) setCurrent(data[0]);
      });
  }, [level]);

  // Handle typing
  const handleInput = (e) => {
    let text = e.target.value.toLowerCase();
    text = text.split(" ").map(convertTone).join(" ");
    setInput(text);
  };

  // Check
  const check = () => {
    if (!current) return;

    const correct = current.pinyin.trim().toLowerCase();
    const user = input.trim().toLowerCase();

    if (correct === user) {
      setFeedback("🎉 Chính xác!");
      setTimeout(() => randomWord(), 900);
    } else {
      setFeedback(`❌ Sai rồi! Đúng là: ${correct}`);
    }
  };

  // Random next word
  const randomWord = () => {
    setFeedback("");
    setInput("");

    setAnimate(true);
    setTimeout(() => setAnimate(false), 300);

    const rnd = list[Math.floor(Math.random() * list.length)];
    setCurrent(rnd);
  };

  if (!current)
    return <p className="mt-10 text-center">Đang tải dữ liệu...</p>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm">
          Luyện Pinyin – <span className="text-amber-600">{level}</span>
        </h1>

        {/* Info button */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-12 h-12 rounded-full bg-amber-500 text-white 
          flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition"
        >
          i
        </button>
      </div>

      {/* POPUP HƯỚNG DẪN */}
      {showGuide && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fadeIn"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="bg-white p-7 rounded-3xl shadow-2xl w-96 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-3 text-amber-700">Hướng dẫn gõ Pinyin</h3>
            <p className="leading-relaxed text-slate-700 space-y-1">
              • Gõ số để thêm dấu: <b>hao3 → hǎo</b> <br />
              • Số 5 = không dấu <br />
              • Tự động đặt dấu đúng vị trí theo chuẩn <br />
              • Gõ trực tiếp bằng bàn phím máy tính
            </p>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full py-3 bg-amber-600 text-white rounded-xl shadow hover:bg-amber-700"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* FLASHCARD */}
      <div
        className={`bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-300
        p-10 rounded-3xl shadow-xl text-center transform transition duration-300
        ${animate ? "scale-95 opacity-70" : "scale-100 opacity-100"}`}
      >
        <div className="text-7xl font-extrabold text-slate-900 mb-4 tracking-wide drop-shadow">
          {current.chinese}
        </div>

        {/* Nghĩa tiếng Việt */}
        <div className="text-2xl text-slate-700 font-medium mb-6 italic">
          {current.vietnamese}
        </div>

        {/* Input */}
        <input
          value={input}
          onChange={handleInput}
          placeholder="Gõ pinyin tại đây..."
          className="w-full text-xl py-4 px-5 text-center border border-amber-300 rounded-xl 
          bg-white shadow focus:ring-4 focus:ring-amber-400 outline-none"
        />

        {/* Check button */}
        <button
          onClick={check}
          className="w-full mt-6 py-3 text-xl bg-amber-600 text-white rounded-xl 
          hover:bg-amber-700 transition shadow"
        >
          Kiểm tra
        </button>

        {/* Feedback */}
        {feedback && (
          <p className="mt-5 text-2xl font-semibold text-slate-900 animate-fadeIn">
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}