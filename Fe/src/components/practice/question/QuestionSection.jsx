// src/components/practice/question/QuestionSection.jsx
import React from "react";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

const QuestionSection = ({
  section,
  sectionIndex,
  questions = [],
  answers = {},
  onAnswerChange,
  startIndex = 1,
  extraTop = null,
}) => {
  const normalizeOption = (opt, idx) => {
    if (typeof opt === "string") {
      const m = opt.match(/^([A-Fa-f])\s*[.\uFF0E、)]?\s*(.+)$/);
      if (m) {
        return {
          id: m[1].toLowerCase(),
          text: m[2].trim(),
        };
      }
      return {
        id: optionLabels[idx].toLowerCase(),
        text: opt,
      };
    }

    return {
      id:
        (opt.id && String(opt.id).toLowerCase()) ||
        optionLabels[idx].toLowerCase(),
      text: opt.text || "",
    };
  };

  const cleanContent = (raw) => {
    if (!raw) return "";
    const trimmed = String(raw).trim();
    if (/^\[EMPTY CONTENT/i.test(trimmed)) return "";
    return trimmed;
  };

  return (
    <section className="mb-8">
      <header className="flex items-center justify-between bg-[#00a5c4] px-6 py-2 text-sm font-semibold text-white">
        <span>
          {section?.title ||
            `${section?.skill === "listening" ? "Nghe" : "Đọc"} - Phần ${
              sectionIndex + 1
            }`}
        </span>
        {section?.instructions && (
          <span className="max-w-[60%] truncate text-[11px] opacity-80">
            {section.instructions}
          </span>
        )}
      </header>

      <div className="bg-white">
        {extraTop}

        {questions.map((q, qIdx) => {
          const globalIndex = startIndex + qIdx;
          const questionId = q._id;
          const selected = answers[questionId] ?? "";

          const imgSrc =
            q.imageUrl ||
            q.imgUrl ||
            (Array.isArray(q.imageUrls) && q.imageUrls[0]) ||
            "";
          const hasImage = !!imgSrc;

          const normalizedOptions = (q.options || []).map((opt, idx) =>
            normalizeOption(opt, idx)
          );

          const content = cleanContent(q.content);
          const skill = section?.skill || "";

          const isListening = skill === "listening";

          const isReadingFillLetter =
            skill === "reading" &&
            ((globalIndex >= 36 && globalIndex <= 45) ||
              (globalIndex >= 51 && globalIndex <= 60));

          const isReadingTrueFalse =
            skill === "reading" && globalIndex >= 46 && globalIndex <= 50;

          const isWriting =
            skill === "writing" || skill === "writing_essay";

          const showContent = !isListening && !!content;

          const handleFillLetterChange = (valueRaw) => {
            let v = (valueRaw || "").toString().toUpperCase();
            v = v.replace(/[^A-F]/g, "");
            if (v.length > 1) v = v.slice(-1);
            onAnswerChange(questionId, v);
          };

          return (
            <div
              key={questionId}
              id={`q-${questionId}`}
              className={
                "items-start gap-4 border-t border-gray-200 px-6 py-4 " +
                (hasImage
                  ? "grid grid-cols-[40px,minmax(0,1fr)] md:grid-cols-[40px,180px,minmax(0,1fr)]"
                  : "grid grid-cols-[40px,minmax(0,1fr)]")
              }
            >
              {/* số câu */}
              <div className="flex justify-center pt-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-400 text-xs text-gray-700">
                  {globalIndex}
                </div>
              </div>

              {/* image (chỉ một số phần có) */}
              {hasImage && (
                <div className="flex justify-center">
                  <img
                    src={imgSrc}
                    alt={`Q${globalIndex}`}
                    className="h-28 w-32 border border-gray-200 object-cover"
                  />
                </div>
              )}

              {/* content + controls */}
              <div className="space-y-2">
                {/* ===== TEXT CÂU HỎI ===== */}
                {showContent && (
                  <div
                    className={
                      isReadingFillLetter
                        ? "flex items-center justify-between gap-4 text-sm text-gray-800"
                        : "text-sm text-gray-800"
                    }
                  >
                    <p className={isReadingFillLetter ? "flex-1 whitespace-pre-wrap" : "whitespace-pre-wrap"}>
                      {content}
                    </p>

                    {/* 36–45 & 51–60: input A–F ở bên phải, cùng hàng với câu */}
                    {isReadingFillLetter && (
                      <div className="shrink-0">
                        <input
                          type="text"
                          maxLength={1}
                          value={selected}
                          onChange={(e) =>
                            handleFillLetterChange(e.target.value)
                          }
                          className="h-8 w-16 rounded-md border border-gray-300 px-2 text-center text-sm"
                          placeholder="A–F"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ===== CÁC KIỂU TRẢ LỜI ===== */}
                {isReadingFillLetter ? null : isReadingTrueFalse ? (
                  <div className="mt-2 flex flex-wrap gap-4">
                  {["✓", "×"].map((symbol, idx) => {
                    const opt = normalizedOptions[idx] || {
                      id: idx === 0 ? "a" : "b",
                    };
                    const checked = selected === opt.id;
              
                    return (
                      <label
                        key={symbol}
                        className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer"
                      >
                        {/* input ẩn, dùng peer để control style của span */}
                        <input
                          type="radio"
                          name={`q-${questionId}`}
                          value={opt.id}
                          checked={checked}
                          onChange={() => onAnswerChange(questionId, opt.id)}
                          className="peer sr-only"
                        />
                        <span
                          className={`
                            inline-flex h-8 w-8 items-center justify-around rounded-full border text-base
                            transition
                            peer-checked:border-[#00a5c4] peer-checked:bg-[#00a5c4]/10
                            border-gray-400 text-gray-800
                          `}
                        >
                          {symbol}
                        </span>
                      </label>
                    );
                  })}
                </div>
                ) : isWriting ? (
                  <div className="mt-1">
                    <textarea
                      rows={3}
                      value={selected}
                      onChange={(e) =>
                        onAnswerChange(questionId, e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Nhập câu trả lời của bạn..."
                    />
                  </div>
                ) : normalizedOptions.length > 0 ? (
                  <div className="space-y-1">
                    {normalizedOptions.map((opt, optIdx) => {
                      const checked = selected === opt.id;
                      return (
                        <label
                          key={`${questionId}-${opt.id}-${optIdx}`}
                          className="flex items-center gap-2 text-sm text-gray-800"
                        >
                          <input
                            type="radio"
                            name={`q-${questionId}`}
                            value={opt.id}
                            checked={checked}
                            onChange={() => onAnswerChange(questionId, opt.id)}
                            className="h-4 w-4 accent-[#00a5c4]"
                          />
                          <span className="font-semibold">
                            {optionLabels[optIdx]}.
                          </span>
                          <span className="whitespace-pre-wrap">
                            {opt.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default QuestionSection;