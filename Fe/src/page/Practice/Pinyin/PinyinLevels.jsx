import { useNavigate } from "react-router-dom";

const levels = [
  { id: "HSK1", name: "HSK 1", desc: "100 từ cơ bản nhất", color: "from-green-400 to-green-600" },
  { id: "HSK2", name: "HSK 2", desc: "150 từ mở rộng", color: "from-emerald-400 to-emerald-600" },
  { id: "HSK3", name: "HSK 3", desc: "300 từ thông dụng", color: "from-blue-400 to-blue-600" },
  { id: "HSK4", name: "HSK 4", desc: "600 từ nâng cao", color: "from-indigo-400 to-indigo-600" },
  { id: "HSK5", name: "HSK 5", desc: "1300 từ chuyên sâu", color: "from-purple-400 to-purple-600" },
  { id: "HSK6", name: "HSK 6", desc: "2500+ từ thành thạo", color: "from-rose-400 to-rose-600" },
];

export default function PinyinLevels() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-slate-800">
        Chọn cấp độ luyện Pinyin
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {levels.map((lv) => (
          <div
            key={lv.id}
            onClick={() => navigate(`/practice/pinyin/${lv.id}`)}
            className={`cursor-pointer rounded-3xl p-7 text-white shadow-lg bg-gradient-to-br ${lv.color} hover:scale-[1.03] transition-transform`}
          >
            <h2 className="text-3xl font-bold mb-2">{lv.name}</h2>
            <p className="opacity-90">{lv.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}