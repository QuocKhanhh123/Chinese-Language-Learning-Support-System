// src/pages/practice/ExamDoingPage.jsx
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    useMemo,
  } from "react";
  import { useLocation, useNavigate, useParams } from "react-router-dom";
  import { toast, ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import Swal from "sweetalert2";
  import { useExamTake, useSubmitExam } from "../../../hooks/useExam";
  import QuestionSection from "../../../components/practice/question/QuestionSection";
  import QuestionNavigator from "../../../components/practice/question/QuestionNavigator";
  import SubmitConfirmModal from "../../../components/practice/question/SubmitConfirmModal";
  
  const LETTER_BANK = ["A", "B", "C", "D", "E", "F"];
  
  const ExamDoingPage = () => {
    const { exam_id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
  
    const attemptIdFromState = location.state?.attemptId || null;
    const [attemptId, setAttemptId] = useState(attemptIdFromState);
    console.log("attemptId:", attemptId, "attemptIdFromState:", attemptIdFromState);
  
    // fetch đề theo exam + attemptId
    const {
      data,
      isLoading,
      error: examError,
    } = useExamTake(exam_id, attemptIdFromState);
  
    const { mutate: submitExam, isLoading: isSubmitting } = useSubmitExam();
  
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const answersRef = useRef({});
  
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [phase, setPhase] = useState("listening"); // 'listening' | 'reading' | 'writing'
  
    // audio cho phần Nghe
    const audioRef = useRef(null);
    const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  
    // nút Lên đầu
    const [showScrollTop, setShowScrollTop] = useState(false);
  
    // ================= ERROR LOAD ĐỀ =================
    useEffect(() => {
      if (!examError) return;
  
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: `${
          examError?.response?.data?.message || "Không lấy được đề thi"
        }`,
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/practice/exam");
        }
      });
    }, [examError, navigate]);
  
    // ================= SUBMIT =================
    const handleSubmit = useCallback(
      async (isAutoSubmit = false) => {
        const currentAnswers = answersRef.current;
        const currentAttemptId = attemptId;
  
        if (!currentAttemptId) {
          setErrorMessage(
            'Không tìm thấy ID lần thi. Vui lòng quay lại trang trước và bấm "Bắt đầu làm bài".'
          );
          return;
        }
  
        if (!exam?.sections) {
          setErrorMessage("Không tìm thấy câu hỏi trong bài thi.");
          return;
        }
  
        const allQuestionIds = (exam.sections || [])
          .flatMap((section) => section.questions || [])
          .map((q) => String(q._id));
  
        const unansweredQuestionId = allQuestionIds.find(
          (questionId) =>
            currentAnswers[questionId] === undefined ||
            currentAnswers[questionId] === null ||
            String(currentAnswers[questionId]).trim() === ""
        );
  
        if (unansweredQuestionId && !isAutoSubmit) {
          const missing = detectMissingSection();
        
          Swal.fire({
            icon: "warning",
            title: "Chưa hoàn thành bài thi",
            html: `
              <div style="text-align:left; font-size:14px; line-height:1.5;">
                Bạn vẫn còn <b>câu hỏi chưa làm</b> trong:
                <ul style="margin-top:6px;">
                  ${missing.map(m => `<li>• ${m}</li>`).join("")}
                </ul>
              </div>
            `,
            confirmButtonText: "OK",
            confirmButtonColor: "#f59e0b",
          });
        
          return;
        }
  
        const getAnswerValue = (questionId) => {
          const raw = currentAnswers[questionId] ?? "";
          return String(raw).trim();
        };
  
        const formattedAnswers = allQuestionIds.map((questionId) => ({
          questionId,
          answer: getAnswerValue(questionId),
        }));
  
        try {
          submitExam(
            {
              attemptId: currentAttemptId,
              answers: formattedAnswers,
            },
            {
              onSuccess: (res) => {
                const resultId =
                  res?.resultId || res?.attemptId || currentAttemptId;
  
                toast.success("Nộp bài thành công!");
  
                setTimeout(() => {
                  navigate(`/practice/exam/result/${resultId}`, {
                    state: { res },
                  });
                }, 500);
              },
              onError: (err) => {
                const message =
                  err?.response?.data?.message ||
                  err.message ||
                  "Lỗi không xác định";
                console.error("Chi tiết lỗi:", err?.response?.data);
  
                setErrorMessage(
                  isAutoSubmit
                    ? `Hết thời gian! Bài thi đã được gửi nhưng có lỗi: ${message}`
                    : `Lỗi khi nộp bài: ${message}`
                );
                toast.error(`Lỗi khi nộp bài: ${message}`);
              },
            }
          );
        } catch (error) {
          console.error("Lỗi hệ thống:", error);
          setErrorMessage("Lỗi hệ thống khi nộp bài: " + error.message);
          toast.error("Lỗi hệ thống khi nộp bài.");
        }
      },
      [attemptId, exam, navigate, submitExam]
    );
  
    // ================= INIT DATA =================
    useEffect(() => {
      if (isLoading || !data) return;
  
      const examData = data.exam || data;
      const fetchedAttemptId =
        data.attemptId ||
        data.resultId ||
        data.result_id ||
        attemptId ||
        attemptIdFromState ||
        null;
  
      if (!examData) {
        setErrorMessage("Không thể tải thông tin bài thi");
        return;
      }
  
      if (!fetchedAttemptId) {
        setErrorMessage("Không tìm thấy lần thi (resultId/attemptId)");
        return;
      }
  
      setAttemptId(fetchedAttemptId);
      setExam(examData);
      setErrorMessage("");
      setHasAutoPlayed(false); // attempt mới -> auto-play lại audio
  
      const savedAnswers = localStorage.getItem(`answers_${fetchedAttemptId}`);
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          setAnswers(parsed);
          answersRef.current = parsed;
        } catch (err) {
          console.error("Lỗi khi parse đáp án từ localStorage:", err);
        }
      }
    }, [data, isLoading, attemptId, attemptIdFromState]);
  
    const handleAnswerChange = (qid, val) => {
      setAnswers((prev) => {
        const updated = { ...prev, [qid]: val };
        answersRef.current = updated;
  
        if (attemptId) {
          localStorage.setItem(`answers_${attemptId}`, JSON.stringify(updated));
        }
        return updated;
      });
    };
  
    // ================= DERIVED: listening / reading / writing =================
    const {
      listeningQuestions,
      readingQuestions,
      writingQuestions,
      listeningIds,
      readingIds,
      writingIds,
    } = useMemo(() => {
      const sections = exam?.sections || [];
      const listening =
        sections.find((s) => s.skill === "listening") || sections[0] || {};
      const reading =
        sections.find((s) => s.skill === "reading") || sections[1] || {};
      const writing =
        sections.find((s) => s.skill === "writing") ||
        sections.find((s) => s.skill === "writing_essay") ||
        {};
  
      const lQs = listening?.questions || [];
      const rQs = reading?.questions || [];
      const wQs = writing?.questions || [];
  
      return {
        listeningQuestions: lQs,
        readingQuestions: rQs,
        writingQuestions: wQs,
        listeningIds: lQs.map((q) => String(q._id)),
        readingIds: rQs.map((q) => String(q._id)),
        writingIds: wQs.map((q) => String(q._id)),
      };
    }, [exam]);
  
    // audio chung phần Nghe (1 file gộp)
    const listeningAudios = exam?.listeningAudios || [];
    const mainListeningAudio =
      listeningAudios[0]?.url ||
      (listeningQuestions[0] && listeningQuestions[0].audioUrl) ||
      "";
  
    // auto-play audio 1 lần khi vào phase listening
    useEffect(() => {
      if (phase !== "listening") return;
      if (hasAutoPlayed) return;
      if (!mainListeningAudio) return;
  
      const audioEl = audioRef.current;
      if (!audioEl) return;
  
      audioEl
        .play()
        .then(() => {
          setHasAutoPlayed(true);
        })
        .catch((err) => {
          console.warn("Autoplay audio failed:", err);
        });
    }, [phase, hasAutoPlayed, mainListeningAudio]);
  
    const listeningDone =
      listeningIds.length > 0 &&
      listeningIds.every((id) => Boolean(answers[id]));
  
    const readingDone =
      readingIds.length > 0 && readingIds.every((id) => Boolean(answers[id]));
  
    // Hiển thị nút Lên đầu theo scroll của window
    useEffect(() => {
      const onScroll = () => {
        setShowScrollTop(window.scrollY > 200);
      };
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }, []);
  
    // ================= RENDER GUARD =================
    if (!isLoading && !data && !attemptId && !attemptIdFromState) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center text-red-600 shadow-sm">
            Không tìm thấy attemptId. Vui lòng quay lại trang chi tiết và bấm
            &quot;Bắt đầu làm bài&quot;.
          </div>
        </div>
      );
    }
  
    if (isLoading || !exam) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-center shadow-sm">
            {isLoading
              ? "Đang tải đề thi..."
              : errorMessage || "Không tìm thấy bài thi"}
          </div>
        </div>
      );
    }
  
    const timeLimit = data?.timeLimitMinutes || exam.timeLimitMinutes || 0;
  
    // ================= HSK2 LISTENING SLICING (1–35) =================
    const listeningAll = listeningQuestions || [];
    const listeningPart1 = listeningAll.slice(0, 10); // 1–10
  
    const listeningPart2All = listeningAll.slice(10, 20); // 11–20
    const listeningPart2Block1 = listeningPart2All.slice(0, 5); // 11–15
    const listeningPart2Block2 = listeningPart2All.slice(5, 10); // 16–20
  
    const listeningPart3 = listeningAll.slice(20, 30); // 21–30
    const listeningPart4 = listeningAll.slice(30, 35); // 31–35
  
    // ================= HSK2 READING SLICING (36–70) =================
    const readingAll = readingQuestions || [];
    const readingPart1 = readingAll.slice(0, 5); // 36–40
    const readingPart2 = readingAll.slice(5, 10); // 41–45
    const readingPart3 = readingAll.slice(10, 15); // 46–50
  
    const reading4Part4 = readingAll.slice(15, 25); // 51–60
    const reading4First = reading4Part4.slice(0, 5); // 51–55
    const reading4Second = reading4Part4.slice(5); // 56–60
  
    const readingPart5 = readingAll.slice(25); // 61–70
  
    // ================= WRITING (71–80) =================
    const writingAll = writingQuestions || []; // 10 câu 写作
  
    // Bank/ảnh từ exam (đã lưu từ UploadQuestionsFile)
    const reading1Images = exam?.reading1Images || [];
    const reading2WordBank = exam?.reading2WordBank || [];
    const reading4BankFirst = exam?.reading4BankFirst || [];
    const reading4BankSecond = exam?.reading4BankSecond || [];
  
    // Nav theo phase
    let navGrouped = [];
    let navStartIndex = 1;
  
    if (phase === "listening") {
      navGrouped = [listeningQuestions];
      navStartIndex = 1;
    } else if (phase === "reading") {
      navGrouped = [readingQuestions];
      navStartIndex = listeningQuestions.length + 1; // 36
    } else {
      navGrouped = [writingQuestions];
      navStartIndex =
        listeningQuestions.length + readingQuestions.length + 1; // 71
    }
    const detectMissingSection = () => {
      const missing = [];
    
      if (listeningIds.some(id => !answersRef.current[id]))
        missing.push("Phần Nghe (听力)");
    
      if (readingIds.some(id => !answersRef.current[id]))
        missing.push("Phần Đọc (阅读)");
    
      if (writingIds.some(id => !answersRef.current[id]))
        missing.push("Phần Viết (写作)");
    
      return missing;
    };
    const handleSwitchPhase = (nextPhase) => {
      if (nextPhase === "reading" && !listeningDone) {
        Swal.fire({
          icon: "info",
          title: "Hoàn thành phần Nghe trước",
          text: "Bạn cần trả lời xong 35 câu Nghe mới có thể mở phần Đọc (阅读).",
          confirmButtonText: "OK",
        });
        return;
      }
      if (nextPhase === "writing" && (!listeningDone || !readingDone)) {
        Swal.fire({
          icon: "info",
          title: "Hoàn thành phần Nghe & Đọc trước",
          text: "Bạn cần làm xong phần 听力 và 阅读 trước khi sang 写作.",
          confirmButtonText: "OK",
        });
        return;
      }
      setPhase(nextPhase);
    };
  
    // ================= UI BLOCK: LISTENING PART 2 (11–20) =================
    const renderListeningMatchingBlock = (questions, baseNumber, titleText) => {
      if (!questions || questions.length === 0) return null;
  
      const letters = LETTER_BANK.slice(0, questions.length);
  
      return (
        <section className="border-b border-gray-200">
          <div className="px-6 pt-5 pb-4">
            <h2 className="text-base font-semibold text-slate-800">
              {titleText}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Hàng trên: tranh được đánh dấu A, B, C... Hàng dưới: với mỗi câu,
              hãy chọn một chữ cái tương ứng với tranh đúng.
            </p>
  
            {/* Hàng ảnh */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {questions.map((q, idx) => {
                const qNumber = baseNumber + idx;
                const src =
                  q.imageUrl ||
                  q.imgUrl ||
                  (Array.isArray(q.imageUrls) ? q.imageUrls[0] : null);
  
                return (
                  <div
                    key={q._id || qNumber}
                    className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="flex items-center justify-between px-3 pt-3">
                      <div className="text-sm font-semibold text-slate-800">
                        Câu {qNumber}
                      </div>
                    </div>
                    {src ? (
                      <div className="flex flex-1 items-center justify-center p-3">
                        <img
                          src={src}
                          alt={`Câu ${qNumber}`}
                          className="max-h-52 w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center justify-center p-3 text-xs text-slate-400">
                        Không có ảnh
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
  
            {/* Hàng chọn đáp án theo A–E/F */}
            <div className="mt-6 space-y-3">
              {questions.map((q, idx) => {
                const qNumber = baseNumber + idx;
                const qId = String(q._id);
                const value = answers[qId] || "";
  
                return (
                  <div
                    key={qId}
                    className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="text-sm font-medium text-slate-800">
                      Câu {qNumber}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {letters.map((letter) => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => handleAnswerChange(qId, letter)}
                          className={`min-w-[40px] rounded-md border px-3 py-1 text-sm font-semibold ${
                            value === letter
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    };
  
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <div className="mx-auto mt-6 flex max-w-6xl border border-gray-200 bg-white shadow-sm">
          {/* LEFT: QuestionNavigator như bình thường, không fixed đặc biệt */}
          <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
            <QuestionNavigator
              groupedQuestions={navGrouped}
              answers={answers}
              startTime={data.startedAt || data.startTime}
              timeLimit={timeLimit}
              onTimeEnd={() => handleSubmit(true)}
              onOpenSubmitModal={() => setShowModal(true)}
              startIndex={navStartIndex}
            />
          </aside>
  
          {/* RIGHT MAIN – cuộn cả trang như bình thường */}
          <main className="flex flex-1 flex-col">
            {/* HEADER */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-[#f5f7fb] px-6 py-2">
              <div className="space-y-1">
                <h1 className="text-sm font-semibold text-slate-800 md:text-base">
                  {exam.title} –{" "}
                  {phase === "listening"
                    ? "听力 (Phần Nghe)"
                    : phase === "reading"
                    ? "阅读 (Phần Đọc)"
                    : "写作 (Phần Viết)"}
                </h1>
                <p className="text-[11px] text-gray-500">
                  {exam.level || "HSK2"} • Thời gian: {timeLimit} phút • Tổng
                  điểm: {exam.totalPoints}
                </p>
              </div>
  
              <div className="inline-flex rounded-full bg-slate-100 p-1 text-base font-semibold">
                <button
                  type="button"
                  onClick={() => setPhase("listening")}
                  className={`rounded-full px-3 py-1 ${
                    phase === "listening"
                      ? "bg-white text-[#00a5c4] shadow-sm"
                      : "text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  听力 (Nghe)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPhase("reading")}
                  className={`rounded-full px-3 py-1 ${
                    phase === "reading"
                      ? "bg-white text-[#00a5c4] shadow-sm"
                      : "text-slate-500"
                  } ${
                    !listeningDone
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-slate-200"
                  }`}
                >
                  阅读 (Đọc)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPhase("writing")}
                  className={`rounded-full px-3 py-1 ${
                    phase === "writing"
                      ? "bg-white text-[#00a5c4] shadow-sm"
                      : "text-slate-500"
                  } ${
                    !listeningDone || !readingDone
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-slate-200"
                  }`}
                >
                  写作 (Viết)
                </button>
              </div>
            </header>
  
            {/* AUDIO PHẦN NGHE */}
            {phase === "listening" && mainListeningAudio && (
              <div className="border-b border-gray-200 bg-slate-50 px-6 py-3">
                <p className="text-xs font-medium text-slate-700">
                  Audio phần Nghe – sẽ tự phát khi bạn bắt đầu làm bài.
                </p>
                <audio
                  ref={audioRef}
                  src={mainListeningAudio}
                  controls
                  className="mt-2 w-full"
                />
              </div>
            )}
  
            {/* NỘI DUNG CÂU HỎI */}
            <div className="flex-1">
              {phase === "listening" && (
                <>
                  {/* 听力 第一部分 – 1–10 */}
                  {listeningPart1.length > 0 && (
                    <QuestionSection
                      section={{
                        title:
                          "听力 第一部分 – 10 câu: Nhìn tranh, 判断 对(Đúng) / 错(Sai)",
                        skill: "listening",
                      }}
                      sectionIndex={0}
                      questions={listeningPart1}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={1}
                    />
                  )}
  
                  {/* 听力 第二部分 – 11–15 */}
                  {renderListeningMatchingBlock(
                    listeningPart2Block1,
                    11,
                    "听力 第二部分 – 5 câu (11–15): Nghe câu, chọn hình đúng (A–E)"
                  )}
  
                  {/* 听力 第二部分 – 16–20 */}
                  {renderListeningMatchingBlock(
                    listeningPart2Block2,
                    16,
                    "听力 第二部分 – 5 câu (16–20): Nghe câu, chọn hình đúng (A–E)"
                  )}
  
                  {/* 听力 第三部分 – 21–30 */}
                  {listeningPart3.length > 0 && (
                    <QuestionSection
                      section={{
                        title:
                          "听力 第三部分 – 10 câu (21–30): Nghe hội thoại + câu hỏi, chọn đáp án đúng",
                        skill: "listening",
                      }}
                      sectionIndex={3}
                      questions={listeningPart3}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={21}
                    />
                  )}
  
                  {/* 听力 第四部分 – 31–35 */}
                  {listeningPart4.length > 0 && (
                    <QuestionSection
                      section={{
                        title:
                          "听力 第四部分 – 5 câu (31–35): Hội thoại dài, chọn đáp án đúng",
                        skill: "listening",
                      }}
                      sectionIndex={4}
                      questions={listeningPart4}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={31}
                    />
                  )}
                </>
              )}
  
              {phase === "reading" && (
                <>
                  {/* 阅读 第一部分 – 36–40 + bank hình A–F */}
                  {readingPart1.length > 0 && (
                    <QuestionSection
                      section={{
                        title: "阅读 第一部分 – 5 câu (36–40)",
                        skill: "reading",
                      }}
                      sectionIndex={0}
                      questions={readingPart1}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={36}
                      extraTop={
                        reading1Images.length > 0 && (
                          <div className="px-6 pt-4 pb-2">
                            <div className="mb-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                              {reading1Images.map((src, idx) => {
                                const label = String.fromCharCode(65 + idx);
                                return (
                                  <div
                                    key={label}
                                    className="relative flex items-center justify-center border border-gray-300 p-2"
                                  >
                                    <span className="absolute left-2 top-2 bg-black/70 px-2 py-0.5 text-lg font-bold text-white">
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
                          </div>
                        )
                      }
                    />
                  )}
  
                  {/* 阅读 第二部分 – 41–45 + word bank */}
                  {readingPart2.length > 0 && (
                    <QuestionSection
                      section={{
                        title: "阅读 第二部分 – 5 câu (41–45)",
                        skill: "reading",
                      }}
                      sectionIndex={1}
                      questions={readingPart2}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={41}
                      extraTop={
                        reading2WordBank.length > 0 && (
                          <div className="px-6 pt-4 pb-2 text-center">
                            {(() => {
                              const sorted = [...reading2WordBank].sort((a, b) =>
                                a.id.localeCompare(b.id)
                              );
                              return (
                                <>
                                  <div className="mb-1 flex justify-center gap-6">
                                    {sorted.map((item) => (
                                      <span
                                        key={`py-${item.id}`}
                                        className="inline-block min-w-[70px] text-base"
                                      >
                                        {item.pinyin}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="mb-2 flex justify-center gap-6">
                                    {sorted.map((item) => (
                                      <span
                                        key={`hz-${item.id}`}
                                        className="inline-block min-w-[70px] text-base"
                                      >
                                        {item.id}. {item.hanzi}
                                      </span>
                                    ))}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )
                      }
                    />
                  )}
  
                  {/* 阅读 第三部分 – 46–50 */}
                  {readingPart3.length > 0 && (
                    <QuestionSection
                      section={{
                        title: "阅读 第三部分 – 5 câu (46–50)",
                        skill: "reading",
                      }}
                      sectionIndex={2}
                      questions={readingPart3}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={46}
                    />
                  )}
  
                  {/* 阅读 第四部分 – 51–55 + bank 1 */}
                  {reading4First.length > 0 && (
                    <QuestionSection
                      section={{
                        title: "阅读 第四部分 – 5 câu (51–55)",
                        skill: "reading",
                      }}
                      sectionIndex={3}
                      questions={reading4First}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={51}
                      extraTop={
                        reading4BankFirst.length > 0 && (
                          <div className="px-6 pt-4 pb-2">
                            {reading4BankFirst.map((item) => {
                              const [pinyin, ...rest] = (item.text || "").split(
                                "\n"
                              );
                              const hanzi = rest.join("\n");
                              return (
                                <div
                                  key={`r4-bank1-${item.id}`}
                                  className="mb-3"
                                >
                                  <p className="mb-0.5 font-bold">{item.id}</p>
                                  {pinyin && (
                                    <p className="mb-0.5 whitespace-pre-wrap text-sm italic">
                                      {pinyin}
                                    </p>
                                  )}
                                  {hanzi && (
                                    <p className="whitespace-pre-wrap text-base">
                                      {hanzi}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )
                      }
                    />
                  )}
  
                  {/* 阅读 第四部分 – 56–60 + bank 2 */}
                  {reading4Second.length > 0 && (
                    <QuestionSection
                      section={{
                        title: "阅读 第四部分 – 5 câu (56–60)",
                        skill: "reading",
                      }}
                      sectionIndex={4}
                      questions={reading4Second}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={56}
                      extraTop={
                        reading4BankSecond.length > 0 && (
                          <div className="px-6 pt-4 pb-2">
                            {reading4BankSecond.map((item) => {
                              const [pinyin, ...rest] = (item.text || "").split(
                                "\n"
                              );
                              const hanzi = rest.join("\n");
                              return (
                                <div
                                  key={`r4-bank2-${item.id}`}
                                  className="mb-3"
                                >
                                  <p className="mb-0.5 font-bold">{item.id}</p>
                                  {pinyin && (
                                    <p className="mb-0.5 whitespace-pre-wrap text-sm italic">
                                      {pinyin}
                                    </p>
                                  )}
                                  {hanzi && (
                                    <p className="whitespace-pre-wrap text-base">
                                      {hanzi}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )
                      }
                    />
                  )}
  
                  {/* 阅读 第五部分 – 61–70 */}
                  {readingPart5.length > 0 && (
                    <QuestionSection
                      section={{
                        title: "阅读 第五部分 – 10 câu (61–70)",
                        skill: "reading",
                      }}
                      sectionIndex={5}
                      questions={readingPart5}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={61}
                    />
                  )}
                </>
              )}
  
              {phase === "writing" && (
                <>
                  {/* 写作 – 71–80 */}
                  {writingAll.length > 0 && (
                    <QuestionSection
                      section={{
                        title: "写作 – 10 câu (71–80)",
                        skill: "writing",
                      }}
                      sectionIndex={0}
                      questions={writingAll}
                      answers={answers}
                      onAnswerChange={handleAnswerChange}
                      startIndex={71}
                    />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
  
        {/* Nút cuộn lên đầu */}
        {showScrollTop && (
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="fixed bottom-6 right-6 z-40 rounded-full bg-[#00a5c4] px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-[#008aa4]"
          >
            ↑ Lên đầu
          </button>
        )}
  
        <SubmitConfirmModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            handleSubmit();
          }}
          isSubmitting={isSubmitting}
        />
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    );
  };
  
  export default ExamDoingPage;