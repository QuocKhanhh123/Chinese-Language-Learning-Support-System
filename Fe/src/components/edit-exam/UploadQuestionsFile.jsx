// src/components/edit-exam/UploadQuestionsFile.jsx
import mammoth from "mammoth";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { saveQuestions } from "./api/questionService";
import {
  uploadImagesForExamQuestions,
  uploadReading1BankImages,
} from "../../utils/services/uploadQuestionsWithImages";

function UploadQuestionsFile({ onSaveCallback }) {
  const [questions, setQuestions] = useState({
    newQuestions: [],
    reading1Images: [],
    reading2WordBank: [],
    reading4BankFirst: [],
    reading4BankSecond: [],
  });

  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const { examId } = useParams();

  // ⬇️ NEW: trạng thái lưu / loading
  const [isSaving, setIsSaving] = useState(false);
  const [saveStep, setSaveStep] = useState("");
  const [saveProgress, setSaveProgress] = useState(0);

  // ===================== DOCX -> HTML + TEXT =====================
  const extractFromDocx = async (arrayBuffer) => {
    const htmlResult = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        convertImage: mammoth.images.inline((element) =>
          element.read("base64").then((imageBuffer) => ({
            src: `data:${element.contentType};base64,${imageBuffer}`,
          }))
        ),
      }
    );

    const textResult = await mammoth.extractRawText({ arrayBuffer });

    return {
      html: htmlResult.value || "",
      plainText: textResult.value || "",
    };
  };

  // ===================== ANSWER KEY =====================
  const parseAnswerKey = (text) => {
    const answerMap = {};
    const idx = text.indexOf("卷答案");
    if (idx === -1) return answerMap;

    const answerText = text.slice(idx);

    // --- Pass 1: bắt A-F hoặc ✓/× hoặc 对/错 (1–60) ---
    const regex = /(\d+)\D*([A-F✓×对错])/g;
    let match;
    while ((match = regex.exec(answerText)) !== null) {
      const num = parseInt(match[1], 10);
      let ans = match[2];

      if (ans === "对") ans = "✓";
      if (ans === "错") ans = "×";

      answerMap[num] = ans;
    }

    // --- Pass 2: bắt full câu/ chữ cho 71–80 ---
    const lines = answerText
      .split("\n")
      .map((l) =>
        (l || "")
          .replace(/[\u200B\uFEFF\u00A0]/g, " ")
          .trim()
      )
      .filter(Boolean);

    lines.forEach((line) => {
      // dạng "71.弟弟高兴地笑了。" hoặc "76.出"
      const m = line.match(/^(\d{1,2})[.．]\s*(.+)$/);
      if (!m) return;

      const num = parseInt(m[1], 10);
      if (num >= 71 && num <= 80) {
        const ansText = m[2].trim();
        if (ansText) {
          answerMap[num] = ansText;
        }
      }
    });

    console.log("===== PARSED ANSWER MAP =====\n", answerMap);
    return answerMap;
  };

  // ===================== NORMALIZE LINE =====================
  const normalizeLine = (line) =>
    (line || "")
      .replace(/[\u200B\uFEFF\u00A0]/g, " ") // zero-width + nbsp
      .replace(/\s+/g, " ")
      .trim();

  // ===================== QUESTION NOS (BẮT SỐ Ở ĐẦU DÒNG) =====================
  const getQuestionNosFromText = (textExam) => {
    const nos = [];
    const lines = textExam
      .split("\n")
      .map(normalizeLine)
      .filter(Boolean);

    lines.forEach((line) => {
      const m = line.match(/^（?(\d{1,2})）?\s*[.\uFF0E\u3002、)]\s*/);
      if (m) {
        const no = parseInt(m[1], 10);
        if (!nos.includes(no)) nos.push(no);
      } else {
        // line chỉ có số: "1" / "（1）"
        const m2 = line.match(/^（?(\d{1,2})）?\s*$/);
        if (m2) {
          const no = parseInt(m2[1], 10);
          if (!nos.includes(no)) nos.push(no);
        }
      }
    });

    // cho phép tới câu 80
    return nos.filter((n) => n >= 1 && n <= 80);
  };

  /**
   * buildImageData:
   *  - Map ảnh cho câu 1–20 (nghe có tranh) dựa theo thứ tự câu xuất hiện
   *  - Ảnh còn lại -> reading1Images (A–F), tối đa 6
   */
  const buildImageData = (html, textExam) => {
    const imageMap = {};
    const reading1Images = [];

    if (!html) return { imageMap, reading1Images };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const imgs = Array.from(doc.getElementsByTagName("img"));

    console.log("FOUND IMAGES:", imgs.length);

    const questionNos = getQuestionNosFromText(textExam);
    console.log("QUESTION NOS FOR IMG MAP:", questionNos);

    // lấy đúng các câu listening có tranh (1..20) theo thứ tự xuất hiện
    const listeningNos = questionNos.filter((n) => n >= 1 && n <= 20);
    const listeningImgCount = Math.min(20, imgs.length, listeningNos.length);

    for (let i = 0; i < listeningImgCount; i++) {
      const qNo = listeningNos[i];
      const src = imgs[i]?.getAttribute("src") || "";
      if (src) imageMap[qNo] = src;
    }

    // Ảnh còn lại -> A–F reading1
    for (
      let i = listeningImgCount;
      i < imgs.length && reading1Images.length < 6;
      i++
    ) {
      const src = imgs[i]?.getAttribute("src") || "";
      if (src) reading1Images.push(src);
    }

    console.log("IMAGE MAP:", imageMap);
    console.log("READING1 IMAGES:", reading1Images.length);

    return { imageMap, reading1Images };
  };

  // ===================== READING4 BANK PARSER =====================
  const parseReading4BankBlock = (lines, headingIdx) => {
    const bank = [];
    let i = headingIdx + 1;

    while (i + 1 < lines.length) {
      const pinyinLine = lines[i];
      const hanziLine = lines[i + 1];

      const m = hanziLine.match(/^([A-F])\s+(.+)/);
      if (!m) break;

      const letter = m[1].toUpperCase();
      const hanzi = m[2].trim();

      bank.push({
        id: letter,
        text: `${pinyinLine}\n${hanzi}`,
      });

      i += 2;
    }

    return { bank, stopIdx: i };
  };

  // ===================== MAIN FORMAT =====================
  const formatQuestions = async (html, plainText) => {
    const answerMap = parseAnswerKey(plainText);

    const answerIdx = plainText.indexOf("卷答案");
    const textExam =
      answerIdx !== -1 ? plainText.slice(0, answerIdx) : plainText;

    const { imageMap, reading1Images } = buildImageData(html, textExam);

    const rawLines = textExam
      .split("\n")
      .map(normalizeLine)
      .filter(Boolean);

    // các heading/instruction cần bỏ qua
    const isHeadingLine = (line) => {
      if (!line) return true;

      // bank chữ cái kiểu "A B C D E F"
      if (/^([A-F]\s*){3,}$/.test(line)) return true;

      // HSK headings
      if (/^听力|^阅读|^I[.、]|^II[.、]/.test(line)) return true;
      if (/^第\s*\d+\s*[-–－~～]\s*\d+\s*题/.test(line)) return true;

      // paragraph hướng dẫn do mammoth sinh
      if (line.startsWith("Paragraph:")) return true;

      // các dòng range kiểu (11-15)
      if (/^\(?\d+\s*[-–－~～]\s*\d+\)?$/.test(line)) return true;

      return false;
    };

    let reading2WordBank = [];
    let reading4BankFirst = [];
    let reading4BankSecond = [];
    const cleanedLines = [];

    const heading41_45Regex = /^第\s*41\s*[-–－~～]\s*45\s*题/;
    const heading51_55Regex = /^第\s*51\s*[-–－~～]\s*55\s*题/;
    const heading56_60Regex = /^第\s*56\s*[-–－~～]\s*60\s*题/;

    // pattern chung cho pinyin + A 完 B 进 ...
    const pinyinPattern =
      /^[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ\s]+$/;
    const fullAfLineRegex =
      /^A\s*\S+\s+B\s*\S+\s+C\s*\S+\s+D\s*\S+\s+E\s*\S+\s+F\s*\S+/;

    // ====== parse bank BEFORE skipping heading ======
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      // ---------- WORD BANK PHẦN 2: trường hợp có heading "第41-45题" ----------
      if (heading41_45Regex.test(line) && !reading2WordBank.length) {
        const pinyinLine = rawLines[i + 1] || "";
        const afLine = rawLines[i + 2] || "";

        const pinyins = pinyinLine.split(/\s+/).filter(Boolean);

        if (
          pinyinPattern.test(pinyinLine) &&
          pinyins.length >= 6 &&
          fullAfLineRegex.test(afLine)
        ) {
          const regexBank = /([A-F])\s*([^\sA-F]+)/g;
          let mb;
          const hanziItems = [];
          while ((mb = regexBank.exec(afLine)) !== null) {
            hanziItems.push({ id: mb[1], hanzi: mb[2] });
          }

          reading2WordBank = hanziItems.map((item, idx) => ({
            id: item.id.toUpperCase(),
            hanzi: item.hanzi,
            pinyin: pinyins[idx] || "",
          }));

          i += 2; // đã consume heading + pinyin + A-F
          continue;
        }
      }

      // ---------- WORD BANK PHẦN 2: TRƯỜNG HỢP NHƯ FILE CỦA BẠN (chỉ có pinyin + A-F) ----------
      if (
        !reading2WordBank.length &&
        pinyinPattern.test(line) &&
        fullAfLineRegex.test(rawLines[i + 1] || "")
      ) {
        const pinyinLine = line;
        const afLine = rawLines[i + 1];

        const pinyins = pinyinLine.split(/\s+/).filter(Boolean);

        const regexBank = /([A-F])\s*([^\sA-F]+)/g;
        let mb;
        const hanziItems = [];
        while ((mb = regexBank.exec(afLine)) !== null) {
          hanziItems.push({ id: mb[1], hanzi: mb[2] });
        }

        reading2WordBank = hanziItems.map((item, idx) => ({
          id: item.id.toUpperCase(),
          hanzi: item.hanzi,
          pinyin: pinyins[idx] || "",
        }));

        i += 1; // đã consume pinyin + A-F
        continue;
      }

      // ---------- READING4 BANK 51–55 ----------
      if (!reading4BankFirst.length && heading51_55Regex.test(line)) {
        const { bank, stopIdx } = parseReading4BankBlock(rawLines, i);
        reading4BankFirst = bank;
        i = stopIdx - 1;
        continue;
      }

      // ---------- READING4 BANK 56–60 ----------
      if (!reading4BankSecond.length && heading56_60Regex.test(line)) {
        const { bank, stopIdx } = parseReading4BankBlock(rawLines, i);
        reading4BankSecond = bank;
        i = stopIdx - 1;
        continue;
      }

      // heading khác → bỏ
      if (isHeadingLine(line)) continue;

      // còn lại đẩy vào cleanedLines để parse câu hỏi
      cleanedLines.push(line);
    }

    // ---- PARSE QUESTIONS ----
    const questionMap = {};
    let currentQuestionNo = null;

    const MAX_QUESTION_NO = 80;

    const ensureQuestion = (no) => {
      if (no < 1 || no > MAX_QUESTION_NO) return null;

      if (!questionMap[no]) {
        // map ✓/× cho phần nghe 1–10 thành a/b
        let rawAns = answerMap[no] || "";
        let fixedAns = rawAns;
        if (no <= 10) {
          if (rawAns === "✓") fixedAns = "a";
          if (rawAns === "×") fixedAns = "b";
        }

        questionMap[no] = {
          no,
          content: "",
          type: "multiple_choice",
          correctAnswer: fixedAns || "",
          options:
            no <= 10
              ? [
                  { id: "a", text: "对" },
                  { id: "b", text: "错" },
                ]
              : [],
          imgUrl: imageMap[no] || "",
        };
      }
      return questionMap[no];
    };

    cleanedLines.forEach((line) => {
      if (!line) return;

      // 0) Line chỉ có số: "1" hoặc "（1）"
      const numOnly = line.match(/^（?(\d{1,2})）?\s*$/);
      if (numOnly) {
        const no = parseInt(numOnly[1], 10);
        currentQuestionNo = no;
        ensureQuestion(no);
        return;
      }

      // 1) Start question có dấu
      const qMatch = line.match(/^（?(\d+)）?\s*[.\uFF0E\u3002、)]\s*(.*)/);
      if (qMatch) {
        const no = parseInt(qMatch[1], 10);
        const firstSentence = (qMatch[2] || "").trim();
        currentQuestionNo = no;

        const q = ensureQuestion(no);
        if (q && firstSentence) q.content = firstSentence;
        return;
      }

      // 2) Options A–F
      const optMatch = line.match(/^([A-F])\s*[.、\uFF0E)]?\s+(.+)/);
      if (optMatch && currentQuestionNo != null) {
        const q = ensureQuestion(currentQuestionNo);
        if (!q) return;

        const letter = optMatch[1].toLowerCase();
        const textOption = optMatch[2].trim();
        if (!q.options.some((o) => o.id === letter)) {
          q.options.push({ id: letter, text: textOption });
        }
        return;
      }

      // 3) Append content
      if (currentQuestionNo != null) {
        const q = ensureQuestion(currentQuestionNo);
        if (!q) return;

        let text = line;
        if (text.startsWith("句子：")) {
          text = text.replace(/^句子：/, "").trim();
        }
        q.content = q.content ? q.content + "\n" + text : text;
      }
    });

    // ---- Build parentQuestions (sort 1..80) ----
    const orderedNos = Object.keys(questionMap)
      .map((n) => parseInt(n, 10))
      .filter((n) => n >= 1 && n <= MAX_QUESTION_NO)
      .sort((a, b) => a - b);

    const parentQuestions = orderedNos.map((no) => {
      const q = questionMap[no];

      let sectionLabel = "";
      if (no >= 1 && no <= 35) {
        sectionLabel = "听力";
      } else if (no >= 36 && no <= 70) {
        sectionLabel = "阅读";
      } else {
        sectionLabel = "写作";
      }

      return {
        parentQuestion: `HSK 2 - ${sectionLabel} - Câu ${no}`,
        paragraph: "",
        imgUrl: q.imgUrl || "",
        audioUrl: "",
        childQuestions: [
          {
            content: q.content || "",
            type: "multiple_choice",
            correctAnswer: q.correctAnswer || "",
            options: q.options || [],
          },
        ],
      };
    });

    return {
      newQuestions: parentQuestions,
      reading1Images,
      reading2WordBank,
      reading4BankFirst,
      reading4BankSecond,
    };
  };

  // ===================== HANDLE UPLOAD =====================
  const handleFileUpload = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        try {
          const { html, plainText } = await extractFromDocx(e.target.result);
          const parsedQuestions = await formatQuestions(html, plainText);
          setQuestions(parsedQuestions);
        } catch (err) {
          console.error("Parse docx error:", err);
          alert("Không đọc được file .docx, kiểm tra lại cấu trúc đề.");
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (file) handleFileUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // ===================== SAVE (UPLOAD ẢNH TRƯỚC) =====================
  const onSaveQuestions = async () => {
    const {
      newQuestions,
      reading1Images,
      reading2WordBank,
      reading4BankFirst,
      reading4BankSecond,
    } = questions;

    if (!newQuestions || newQuestions.length === 0) {
      alert("Phải có ít nhất một Phần (parentQuestion).");
      return;
    }

    const invalidParents = newQuestions.filter(
      (parent) => !parent.childQuestions || parent.childQuestions.length === 0
    );
    if (invalidParents.length > 0) {
      alert("Mỗi Phần phải có ít nhất một câu hỏi con.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveStep("Đang xử lý dữ liệu câu hỏi...");
      setSaveProgress(5);

      const metaBase = {
        examId,
        courseId: "unknown-course",
        courseTitle: "unknown-course",
        lessonId: "unknown-lesson",
        lessonTitle: "unknown-lesson",
      };

      // 1) gắn orderNo + sectionType để upload ảnh đúng path
      const parentsWithMeta = newQuestions.map((p, idx) => {
        const m = (p.parentQuestion || "").match(/Câu\s*(\d+)/i);
        const orderNo = m ? parseInt(m[1], 10) : idx + 1;
        let sectionType = "reading";

        if (orderNo >= 1 && orderNo <= 35) sectionType = "listening";
        else if (orderNo >= 36 && orderNo <= 70) sectionType = "reading";
        else sectionType = "writing";

        return { ...p, orderNo, sectionType };
      });

      // 2) upload ảnh từng câu
      setSaveStep("Đang upload ảnh câu hỏi...");
      const parentsAfterUpload = await uploadImagesForExamQuestions(
        parentsWithMeta,
        metaBase,
        ({ orderNo, progress }) => {
          setSaveStep(`Đang upload ảnh câu hỏi (Câu ${orderNo})...`);
          // progress (0-100?), map nhẹ sang thanh progress tổng
          setSaveProgress(Math.min(60, Math.max(10, progress * 0.6)));
        }
      );

      // 3) upload bank A–F reading1
      setSaveStep("Đang upload ảnh bank 阅读 第一部分...");
      const reading1ImagesUploaded = await uploadReading1BankImages(
        reading1Images,
        metaBase,
        ({ index, progress }) => {
          setSaveStep(
            `Đang upload bank hình 阅读 第1部分 (${index + 1}/${reading1Images.length})...`
          );
          setSaveProgress(
            60 + Math.min(20, Math.max(0, (progress / 100) * 20))
          );
        }
      );

      // 4) bỏ helper fields + gọi BE
      setSaveStep("Đang lưu dữ liệu câu hỏi vào hệ thống...");
      setSaveProgress(90);

      const payloadParents = parentsAfterUpload.map((p) => {
        const clone = { ...p };
        delete clone.orderNo;
        delete clone.sectionType;
        return clone;
      });

      const bodyToBE = {
        newQuestions: payloadParents,
        reading1Images: reading1ImagesUploaded,
        reading2WordBank,
        reading4BankFirst,
        reading4BankSecond,
      };

      const res = await saveQuestions(examId, bodyToBE);

      if (res.status === 200 || res.status === 201) {
        setSaveProgress(100);
        alert("Questions + images saved successfully");
        clearFileInput();
        onSaveCallback && onSaveCallback();
      }
    } catch (err) {
      console.error("Save questions with images error:", err);
      alert("Lưu câu hỏi/ảnh thất bại. Xem console để biết lỗi.");
    } finally {
      setIsSaving(false);
      setSaveStep("");
      setSaveProgress(0);
    }
  };

  const clearFileInput = () => {
    setFile(null);
    setQuestions({
      newQuestions: [],
      reading1Images: [],
      reading2WordBank: [],
      reading4BankFirst: [],
      reading4BankSecond: [],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ===================== SLICING HSK2 =====================
  const allParents = questions?.newQuestions || [];

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

  const reading1Images = questions?.reading1Images || [];
  const reading2WordBank = questions?.reading2WordBank || [];
  const reading4BankFirst = questions?.reading4BankFirst || [];
  const reading4BankSecond = questions?.reading4BankSecond || [];

  // ===================== HELPERS RENDER (GIỮ NGUYÊN UI) =====================
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
                  </span>{" "}
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

  // ===================== UI (GIỮ NGUYÊN + THÊM PHẦN 5 & VIẾT) =====================
  return (
    <div className="my-3 relative">
      {/* 🌀 Overlay loading khi đang lưu */}
      {isSaving && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
          <div className="w-[260px] rounded-2xl bg-white px-6 py-4 text-center shadow-lg">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="mb-1 text-sm font-semibold text-gray-800">
              Đang lưu bộ câu hỏi...
            </p>
            {saveStep && (
              <p className="mb-2 text-[11px] text-gray-500">{saveStep}</p>
            )}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(saveProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        onChange={(e) => setFile((e.target.files && e.target.files[0]) || null)}
      />

      {/* ============ NGHE: PHẦN 1 (1–10) ============ */}
      {listening1.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            听力 第一部分 – 10 câu: Nhìn tranh, 判断 对(Đúng) / 错(Sai)
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
            听力 第二部分 – 10 câu: Nghe câu / hội thoại ngắn, chọn hình phù hợp
          </h2>
          {renderListening2Group(listening2.slice(0, 5), 11)}
          {renderListening2Group(listening2.slice(5, 10), 16)}
        </div>
      )}

      {/* ============ NGHE: PHẦN 3 (21–30) ============ */}
      {listening3.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-primary mb-4">
            听力 第三部分 – 10 câu: Nghe hội thoại + câu hỏi, chọn đáp án đúng
          </h2>
          <div className="flex flex-col gap-4">
            {listening3.map((parent, idx) => {
              const globalIndex = 20 + idx + 1;
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
            听力 第四部分 – 5 câu: Hội thoại dài, chọn đáp án đúng
          </h2>
          <div className="flex flex-col gap-4">
            {listening4.map((parent, idx) => {
              const globalIndex = 30 + idx + 1;
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
          {/* 阅读 第一部分 */}
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
                  const globalIndex = 35 + idx + 1;

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
                            Chưa bắt được từ phần 卷答案
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 阅读 第二部分 */}
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
                  const globalIndex = 41 + idx;

                  const correctLetterRaw = child.correctAnswer
                    ? String(child.correctAnswer).toUpperCase()
                    : "";
                  const wordItem = reading2WordBank.find(
                    (w) => w.id === correctLetterRaw
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
                        ) : correctLetterRaw ? (
                          <span className="inline-flex h-10 w-10 items-center justify-center border-2 border-black font-bold text-lg">
                            {correctLetterRaw}
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm">
                            Chưa bắt được từ phần 卷答案
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 阅读 第三部分 */}
          {reading3.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-3">
                阅读 第三部分 – 5 câu (46–50)
              </h2>
              <div className="flex flex-col gap-4">
                {reading3.map((parent, idx) => {
                  const child = parent.childQuestions?.[0] || {
                    options: [],
                    correctAnswer: "",
                  };
                  const globalIndex = 45 + idx + 1;

                  const lines = (child.content || "").split("\n");
                  const starLines = lines.filter((l) =>
                    l.trim().startsWith("★")
                  );
                  const normalLines = lines.filter(
                    (l) => !l.trim().startsWith("★")
                  );

                  const rawAns = (child.correctAnswer || "")
                    .toString()
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
                            Chưa bắt được đáp án
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
                  const globalIndex = 61 + idx;

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
                            Chưa bắt được đáp án
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

                  {/* Đáp án gợi ý lấy từ 卷答案 */}
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

      {/* Buttons */}
      {allParents.length > 0 && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={clearFileInput}
            type="button"
            className="primary-btn bg-blue-100 hover:bg-blue-200 text-blue-700 hover:border-blue-200 hover:text-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Xóa bộ câu hỏi"
            disabled={isSaving}
          >
            Xóa bộ câu hỏi
          </button>
          <button
            onClick={onSaveQuestions}
            type="button"
            className="primary-btn disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving ? "Đang lưu..." : "Lưu bộ câu hỏi"}
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadQuestionsFile;