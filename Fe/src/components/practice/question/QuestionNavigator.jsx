// src/components/practice/question/QuestionNavigator.jsx
import React from "react";
import TimerDisplay from "./TimerDisplay";

const QuestionNavigator = ({
  groupedQuestions = [],
  answers = {},
  startTime,
  timeLimit,
  onTimeEnd = () => {},
  onOpenSubmitModal,
  startIndex = 1, // offset: nghe 1–35, đọc 36–60
  onScrollTop, // 👈 thêm prop
}) => {
  const flatQuestions = groupedQuestions.flat();
  const totalQuestions = flatQuestions.length;

  const questionItems = flatQuestions.map((q, idx) => ({
    index: startIndex + idx,
    id: q._id,
  }));

  const answeredSet = new Set(Object.keys(answers || {}));

  return (
    // 👇 thêm sticky + h-screen ở đây
    <div className="sticky top-0 flex h-screen flex-col">
      {/* TOP: timer bar */}
      <div className="bg-[#00a5c4] px-4 py-3 text-white">
        <p className="text-[11px] uppercase tracking-wide opacity-80">
          Thời gian còn lại
        </p>
        <div className="mt-1">
          <TimerDisplay
            initialTime={startTime}
            time_limit={timeLimit}
            onTimeEnd={onTimeEnd}
          />
        </div>
        <p className="mt-2 text-[11px] opacity-80">
          Đã trả lời:{" "}
          <span className="font-semibold">
            {answeredSet.size}/{totalQuestions}
          </span>
        </p>
      </div>

      {/* BODY: grid câu hỏi */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-500">
          Câu hỏi
        </p>

        <div className="grid grid-cols-5 gap-1.5">
          {questionItems.map((item) => {
            const isAnswered = answeredSet.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  const el = document.getElementById(`q-${item.id}`);
                  if (el) {
                    el.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className={`h-7 w-7 rounded-full text-[11px] font-medium shadow-sm
                  ${
                    isAnswered
                      ? "bg-[#00a5c4] text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {item.index}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM: nút nộp bài + lên đầu */}
      <div className="space-y-2 border-t border-gray-200 px-4 py-3">
        <button
          type="button"
          onClick={onOpenSubmitModal}
          className="w-full rounded-full bg-[#ff9f1a] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#ff8c00]"
        >
          Nộp bài
        </button>

        {onScrollTop && (
          <button
            type="button"
            onClick={onScrollTop}
            className="w-full rounded-full border border-gray-300 bg-white px-3 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
          >
            ↑ Lên đầu trang
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionNavigator;