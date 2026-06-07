// src/components/edit-exam/HSK2Preview.jsx
import React, { useMemo } from "react";

function HSKPreview({
  questions = [],
  reading1Images = [],
  reading2WordBank = [],
  reading4BankFirst = [],
  reading4BankSecond = [],
  listeningAudios = [], // 👈 NHẬN THÊM PROP LISTENING AUDIOS
}) {
  // ========= SLICING ĐÚNG THEO CẤU TRÚC HSK2 =========
  const {
    listening1,
    listening2,
    listening3,
    listening4,
    reading1,
    reading2,
    reading3,
    reading4First,
    reading4Second,
    reading5,
    writingAll,
  } = useMemo(() => {
    const allParents = questions || [];

    // 1–35: 听力
    const listeningAll = allParents.slice(0, 35);
    const listening1 = listeningAll.slice(0, 10); // 1–10
    const listening2 = listeningAll.slice(10, 20); // 11–20
    const listening3 = listeningAll.slice(20, 30); // 21–30
    const listening4 = listeningAll.slice(30, 35); // 31–35

    // 36–70: 阅读
    const readingAll = allParents.slice(35, 70);
    const reading1 = readingAll.slice(0, 5); // 36–40
    const reading2 = readingAll.slice(5, 10); // 41–45
    const reading3 = readingAll.slice(10, 15); // 46–50

    // Phần 4: 51–60
    const reading4Part4 = readingAll.slice(15, 25); // 51–60
    const reading4First = reading4Part4.slice(0, 5); // 51–55
    const reading4Second = reading4Part4.slice(5); // 56–60

    // Phần 5: 61–70
    const reading5 = readingAll.slice(25); // 61–70

    // 71–80: 写作
    const writingAll = allParents.slice(70); // 71–80

    return {
      listening1,
      listening2,
      listening3,
      listening4,
      reading1,
      reading2,
      reading3,
      reading4First,
      reading4Second,
      reading5,
      writingAll,
    };
  }, [questions]);

  // ===== helper render giống UploadQuestionsFile =====
  const renderListening2Group = (group, startIndex) => {
    if (!group.length) return null;

    return (
      <div className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {group.map((parent, idx) => {
            const qNo = startIndex + idx;
            return (
              <div
                key={`listen2-img-${qNo}`}
                className="border border-gray-200 rounded p-2 flex flex-col items-center"
              >
                <p className="font-semibold mb-2">Câu {qNo}</p>
                {parent.imgUrl && (
                  <img
                    src={parent.imgUrl}
                    alt={`Câu ${qNo}`}
                    className="max-h-40 object-contain"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {group.map((parent, idx) => {
            const qNo = startIndex + idx;
            const child = parent.childQuestions?.[0] || {
              options: [],
              correctAnswer: "",
            };

            const correctOpt =
              child.options.find(
                (o) =>
                  o.id.toLowerCase() ===
                  String(child.correctAnswer || "").toLowerCase()
              ) || null;

            return (
              <div
                key={`listen2-ans-${qNo}`}
                className="border border-gray-200 rounded p-3"
              >
                <p className="font-semibold ">
                  Câu {qNo}
                  <span className="text-green-700 ml-10 p-1 border-2 border-black">
                    {correctOpt
                      ? `${correctOpt.id.toUpperCase()}. ${correctOpt.text}`
                      : child.correctAnswer}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReading4Group = (group, bank, startNo, titleLabel) => {
    if (!group.length) return null;

    return (
      <div className="mb-10">
        <p className="font-semibold mb-2">{titleLabel}</p>

        <div className="mb-6">
          {bank.map((item) => {
            const [pinyin, ...rest] = (item.text || "").split("\n");
            const hanzi = rest.join("\n");

            return (
              <div key={`r4-bank-${titleLabel}-${item.id}`} className="mb-3">
                <p className="font-bold mb-0.5">{item.id}</p>
                {pinyin && (
                  <p className="italic text-sm whitespace-pre-wrap mb-0.5">
                    {pinyin}
                  </p>
                )}
                {hanzi && (
                  <p className="text-base whitespace-pre-wrap">{hanzi}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {group.map((parent, idx) => {
            const child = parent.childQuestions?.[0] || {
              content: "",
              correctAnswer: "",
            };
            const globalIndex = startNo + idx;

            const correctLetter = child.correctAnswer
              ? String(child.correctAnswer).toUpperCase()
              : "";

            return (
              <div
                key={`r4-q-${titleLabel}-${idx}`}
                className="pb-3 border-b border-dashed border-gray-300"
              >
                <p className="font-semibold mb-1">{globalIndex}.</p>
                <p className="whitespace-pre-wrap">{child.content}</p>

                <div className="mt-2 flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center border-2 border-black font-bold">
                    {correctLetter}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* ============ DANH SÁCH AUDIO PHẦN NGHE (Firebase) ============ */}
      {Array.isArray(listeningAudios) && listeningAudios.length > 0 && (
        <div className="mt-6 mb-6">
          <h2 className="text-xl font-bold text-primary mb-3">
            Audio phần 听力 (đã upload)
          </h2>
          <div className="flex flex-col gap-3">
            {listeningAudios.map((audio, idx) => (
              <div
                key={audio.url || idx}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border border-gray-200 rounded p-3 bg-gray-50"
              >
                <div className="w-full sm:w-1/4 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <p
                    className="text-sm font-medium truncate"
                    title={audio.name || audio.url}
                  >
                    {audio.name || audio.url}
                  </p>
                </div>
                <div className="w-full sm:flex-1">
                  <audio
                    controls
                    src={audio.url}
                    className="w-full mt-1 outline-none"
                  >
                    Trình duyệt không hỗ trợ audio.
                  </audio>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ NGHE: PHẦN 1 (1–10) ============ */}
      {listening1.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            听力 第一部分 – 10 câu: Nhìn tranh, 判断 对/错
          </h2>
          <div className="flex flex-col gap-6">
            {listening1.map((parent, idx) => {
              const child = parent.childQuestions?.[0] || {
                options: [],
                correctAnswer: "",
              };

              return (
                <div
                  key={`listen1-${idx}`}
                  className="border border-gray-300 p-4 rounded shadow"
                >
                  <p className="font-semibold mb-2">Câu {idx + 1}</p>
                  {parent.imgUrl && (
                    <div className="flex justify-center my-3">
                      <img
                        src={parent.imgUrl}
                        alt={`Câu ${idx + 1}`}
                        className="max-h-64 object-contain"
                      />
                    </div>
                  )}

                  <ul className="mt-2 space-y-1 pl-4">
                    {child.options.map((opt) => {
                      const isCorrect =
                        opt.id.toLowerCase() ===
                        String(child.correctAnswer || "").toLowerCase();

                      return (
                        <li
                          key={opt.id}
                          className={
                            isCorrect ? "text-green-600 font-semibold" : ""
                          }
                        >
                          {opt.id.toUpperCase()}. {opt.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============ NGHE: PHẦN 2 (11–20) ============ */}
      {listening2.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-primary mb-4">
            听力 第二部分 – 10 câu
          </h2>
          {renderListening2Group(listening2.slice(0, 5), 11)}
          {renderListening2Group(listening2.slice(5, 10), 16)}
        </div>
      )}

      {/* ============ NGHE: PHẦN 3 (21–30) ============ */}
      {listening3.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-primary mb-4">
            听力 第三部分 – 10 câu
          </h2>
          <div className="flex flex-col gap-4">
            {listening3.map((parent, idx) => {
              const globalIndex = 20 + idx + 1; // 21–30
              const child = parent.childQuestions?.[0] || {
                options: [],
                correctAnswer: "",
              };

              return (
                <div
                  key={`listen3-${idx}`}
                  className="border border-gray-200 p-3 rounded"
                >
                  <p className="font-semibold mb-1">Câu {globalIndex}</p>
                  <ul className="mt-1 space-y-1 pl-4">
                    {child.options.map((opt) => {
                      const isCorrect =
                        opt.id.toLowerCase() ===
                        String(child.correctAnswer || "").toLowerCase();

                      return (
                        <li
                          key={opt.id}
                          className={
                            isCorrect ? "text-green-600 font-semibold" : ""
                          }
                        >
                          {opt.id.toUpperCase()}. {opt.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============ NGHE: PHẦN 4 (31–35) ============ */}
      {listening4.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-primary mb-4">
            听力 第四部分 – 5 câu
          </h2>
          <div className="flex flex-col gap-4">
            {listening4.map((parent, idx) => {
              const globalIndex = 30 + idx + 1; // 31–35
              const child = parent.childQuestions?.[0] || {
                options: [],
                correctAnswer: "",
              };

              return (
                <div
                  key={`listen4-${idx}`}
                  className="border border-gray-200 p-3 rounded"
                >
                  <p className="font-semibold mb-1">Câu {globalIndex}</p>
                  <ul className="mt-1 space-y-1 pl-4">
                    {child.options.map((opt) => {
                      const isCorrect =
                        opt.id.toLowerCase() ===
                        String(child.correctAnswer || "").toLowerCase();

                      return (
                        <li
                          key={opt.id}
                          className={
                            isCorrect ? "text-green-600 font-semibold" : ""
                          }
                        >
                          {opt.id.toUpperCase()}. {opt.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============ ĐỌC: PHẦN 1–5 (36–70) ============ */}
      {(reading1.length ||
        reading2.length ||
        reading3.length ||
        reading4First.length ||
        reading4Second.length ||
        reading5.length) > 0 && (
        <div className="mt-10">
          {/* 阅读 第一部分 – 36–40 */}
          {reading1.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-3">
                阅读 第一部分 – 5 câu (36–40)
              </h2>

              {reading1Images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {reading1Images.map((src, idx) => {
                    const label = String.fromCharCode(65 + idx);
                    return (
                      <div
                        key={label}
                        className="relative border border-gray-300 p-2 flex items-center justify-center"
                      >
                        <span className="absolute left-2 top-2 font-bold text-lg text-white bg-black bg-opacity-70 px-2 py-0.5">
                          {label}
                        </span>
                        <img
                          src={src}
                          alt={`Hình ${label}`}
                          className="max-h-40 object-contain"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {reading1.map((parent, idx) => {
                  const child = parent.childQuestions?.[0] || {
                    options: [],
                    correctAnswer: "",
                  };
                  const globalIndex = 35 + idx + 1; // 36–40

                  const correctOpt =
                    child.options.find(
                      (o) =>
                        o.id.toLowerCase() ===
                        String(child.correctAnswer || "").toLowerCase()
                    ) || null;
                  const correctLetter = correctOpt
                    ? correctOpt.id.toUpperCase()
                    : child.correctAnswer
                    ? String(child.correctAnswer).toUpperCase()
                    : "";

                  return (
                    <div
                      key={`read1-${idx}`}
                      className="border border-gray-300 p-3 rounded"
                    >
                      <p className="font-semibold mb-2">Câu {globalIndex}</p>
                      <p className="mb-3 whitespace-pre-wrap">
                        {child.content}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-700">
                          Đáp án đúng:
                        </span>
                        {correctLetter ? (
                          <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black font-bold text-lg">
                            {correctLetter}
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm">
                            Chưa có đáp án
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 阅读 第二部分 – 41–45 */}
          {reading2.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-3">
                阅读 第二部分 – 5 câu (41–45)
              </h2>

              {reading2WordBank.length > 0 && (
                <div className="mb-6 text-center">
                  {(() => {
                    const sorted = [...reading2WordBank].sort((a, b) =>
                      a.id.localeCompare(b.id)
                    );
                    return (
                      <>
                        <div className="flex justify-center gap-10 mb-1">
                          {sorted.map((item) => (
                            <span
                              key={`py-${item.id}`}
                              className="inline-block min-w-[70px] text-lg"
                            >
                              {item.pinyin}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-center gap-10">
                          {sorted.map((item) => (
                            <span
                              key={`hz-${item.id}`}
                              className="inline-block min-w-[70px] text-lg"
                            >
                              {item.id}. {item.hanzi}
                            </span>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {reading2.map((parent, idx) => {
                  const child = parent.childQuestions?.[0] || {
                    options: [],
                    correctAnswer: "",
                  };
                  const globalIndex = 41 + idx; // 41–45

                  const correctLetter = child.correctAnswer
                    ? String(child.correctAnswer).toUpperCase()
                    : "";
                  const wordItem = reading2WordBank.find(
                    (w) => w.id === correctLetter
                  );

                  return (
                    <div
                      key={`read2-${idx}`}
                      className="border border-gray-300 p-3 rounded"
                    >
                      <p className="font-semibold mb-2">Câu {globalIndex}</p>
                      <p className="mb-2 whitespace-pre-wrap">
                        {child.content}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-700">
                          Đáp án đúng:
                        </span>
                        {wordItem ? (
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black font-bold text-lg">
                              {wordItem.id}
                            </span>
                            <div>
                              <p className="text-sm italic">
                                {wordItem.pinyin}
                              </p>
                              <p className="text-lg">{wordItem.hanzi}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black font-bold text-lg">
                            {correctLetter}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 阅读 第三部分 – 46–50 */}
          {reading3.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-3">
                阅读 第三部分 – 5 câu (46–50)
              </h2>
              <div className="flex flex-col gap-4">
                {reading3.map((parent, idx) => {
                  const child = parent.childQuestions?.[0] || {
                    content: "",
                    correctAnswer: "",
                  };
                  const globalIndex = 45 + idx + 1; // 46–50

                  const lines = (child.content || "").split("\n");
                  const starLines = lines.filter((l) =>
                    l.trim().startsWith("★")
                  );
                  const normalLines = lines.filter(
                    (l) => !l.trim().startsWith("★")
                  );

                  const rawAns = (child.correctAnswer || "")
                    .trim()
                    .toUpperCase();
                  let symbol = "";
                  let labelVi = "";
                  if (["A", "对", "✓"].includes(rawAns)) {
                    symbol = "✓";
                    labelVi = "Đúng";
                  } else if (["B", "错", "×", "X"].includes(rawAns)) {
                    symbol = "×";
                    labelVi = "Sai";
                  }

                  return (
                    <div
                      key={`read3-${idx}`}
                      className="border border-gray-300 p-3 rounded"
                    >
                      <p className="font-semibold mb-1">Câu {globalIndex}</p>

                      <div className="mb-2">
                        {normalLines.map((line, i) => (
                          <p
                            key={`r3-normal-${i}`}
                            className="whitespace-pre-wrap"
                          >
                            {line}
                          </p>
                        ))}
                        {starLines.length > 0 && (
                          <div className="mt-2 pl-4 border-l-2 border-dashed border-gray-300">
                            {starLines.map((line, i) => (
                              <p
                                key={`r3-star-${i}`}
                                className="whitespace-pre-wrap font-semibold"
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-700">
                          Đáp án đúng:
                        </span>
                        {symbol ? (
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black font-bold text-2xl">
                              {symbol}
                            </span>
                            <span className="text-sm text-gray-700">
                              ({labelVi})
                            </span>
                          </div>
                        ) : (
                          <span className="text-red-600 text-sm">
                            Chưa có đáp án
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 阅读 第四部分 – 51–60 */}
          {(reading4First.length > 0 || reading4Second.length > 0) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-3">
                阅读 第四部分 – 10 câu (51–60)
              </h2>

              {renderReading4Group(
                reading4First,
                reading4BankFirst,
                51,
                "第 51–55 题"
              )}
              {renderReading4Group(
                reading4Second,
                reading4BankSecond,
                56,
                "第 56–60 题"
              )}
            </div>
          )}

          {/* 阅读 第五部分 – 61–70 */}
          {reading5.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-3">
                阅读 第五部分 – 10 câu (61–70)
              </h2>
              <div className="flex flex-col gap-4">
                {reading5.map((parent, idx) => {
                  const child = parent.childQuestions?.[0] || {
                    options: [],
                    correctAnswer: "",
                  };
                  const globalIndex = 61 + idx; // 61–70

                  const correctOpt =
                    child.options.find(
                      (o) =>
                        o.id.toLowerCase() ===
                        String(child.correctAnswer || "").toLowerCase()
                    ) || null;

                  return (
                    <div
                      key={`read5-${idx}`}
                      className="border border-gray-300 p-3 rounded"
                    >
                      <p className="font-semibold mb-2">Câu {globalIndex}</p>
                      <p className="mb-2 whitespace-pre-wrap">
                        {child.content}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-700">
                          Đáp án đúng:
                        </span>
                        {correctOpt ? (
                          <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black font-bold text-lg">
                            {correctOpt.id.toUpperCase()}
                          </span>
                        ) : child.correctAnswer ? (
                          <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black font-bold text-lg">
                            {String(child.correctAnswer).toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm">
                            Chưa có đáp án
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ 写作: 71–80 ============ */}
      {writingAll.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-primary mb-3">
            写作 – 10 câu (71–80)
          </h2>
          <div className="flex flex-col gap-4">
            {writingAll.map((parent, idx) => {
              const child = parent.childQuestions?.[0] || {
                content: "",
                correctAnswer: "",
              };
              const globalIndex = 71 + idx;
              return (
                <div
                  key={`writing-${idx}`}
                  className="border border-gray-300 p-3 rounded"
                >
                  <p className="font-semibold mb-2">Câu {globalIndex}</p>

                  {/* Đề bài */}
                  {child.content && (
                    <>
                      {/* <p className="text-sm text-gray-700 mb-1">Đề bài:</p> */}
                      <p className="whitespace-pre-wrap">{child.content}</p>
                    </>
                  )}

                  {/* Đáp án mẫu (từ 卷答案) */}
                  {child.correctAnswer && (
                    <>
                      <p className="mt-3 text-sm text-gray-700">Đáp án:</p>
                      <p className="whitespace-pre-wrap font-semibold">
                        {child.correctAnswer}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default HSKPreview;