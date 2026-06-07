// ChineseKeyboardHighlight.jsx
export default function ChineseKeyboardHighlight({ activeKey }) {
  const layout = [
    [
      { key: "Q", rad: "手" },
      { key: "W", rad: "田" },
      { key: "E", rad: "水" },
      { key: "R", rad: "口" },
      { key: "T", rad: "廿" },
      { key: "Y", rad: "卜" },
      { key: "U", rad: "山" },
      { key: "I", rad: "戈" },
      { key: "O", rad: "人" },
      { key: "P", rad: "心" },
    ],
    [
      { key: "A", rad: "日" },
      { key: "S", rad: "尸" },
      { key: "D", rad: "木" },
      { key: "F", rad: "火" },
      { key: "G", rad: "土" },
      { key: "H", rad: "竹" },
      { key: "J", rad: "十" },
      { key: "K", rad: "大" },
      { key: "L", rad: "中" },
    ],
    [
      { key: "Z", rad: "重" },
      { key: "X", rad: "難" },
      { key: "C", rad: "金" },
      { key: "V", rad: "女" },
      { key: "B", rad: "月" },
      { key: "N", rad: "弓" },
      { key: "M", rad: "一" },
    ],
  ];

  const specialKeys = {
    " ": "Space",
    Backspace: "Back",
  };

  const normalized = (key) => {
    if (specialKeys[key]) return specialKeys[key];
    return key.toUpperCase();
  };

  return (
    <div className="inline-block p-5 rounded-2xl bg-slate-100 border border-slate-300 shadow-inner">
      {layout.map((row, idx) => (
        <div key={idx} className="flex justify-center gap-3 mb-3">
          {row.map(({ key, rad }) => {
            const isActive = normalized(activeKey) === key;

            return (
              <div
                key={key}
                className={`relative w-14 h-16 rounded-xl border shadow flex flex-col items-center justify-center transition 
                  ${isActive ? "bg-amber-300 border-amber-500 scale-105" : "bg-white border-slate-300"}`}
              >
                <span className="text-lg font-bold text-slate-700">{key}</span>
                <span className="text-sm text-red-600 absolute bottom-1">
                  {rad}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      {/* SPECIAL KEYS */}
      <div className="flex justify-center gap-3 mt-4">
        <div
          className={`px-12 py-3 rounded-xl border shadow transition
            ${normalized(activeKey) === "Space" ? "bg-amber-300 border-amber-500 scale-105" : "bg-white border-slate-300"}`}
        >
          Space
        </div>

        <div
          className={`px-6 py-3 rounded-xl border shadow transition
            ${normalized(activeKey) === "Back" ? "bg-amber-300 border-amber-500 scale-105" : "bg-white border-slate-300"}`}
        >
          Backspace
        </div>
      </div>
    </div>
  );
}