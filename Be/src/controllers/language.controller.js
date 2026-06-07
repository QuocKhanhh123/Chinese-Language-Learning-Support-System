const axios = require("axios");
const { pinyin } = require("pinyin"); // ✅ FIX Ở ĐÂY
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ApiRes = require("../res/apiRes");
const asyncHandler = require("../middleware/asyncHandler");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ======================
// GEMINI TRANSLATE HELPER
// ======================
async function translateWithGemini(text, modelName) {
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
Bạn là chuyên gia tiếng Trung HSK.
Hãy dịch câu tiếng Việt sau sang tiếng Trung phổ thông (简体中文).
Chỉ trả về CHỮ TRUNG, không giải thích, không pinyin.

"${text}"
`;

  const result = await model.generateContent(prompt);
  return result.response.text().replace(/\n/g, "").trim();
}

// ======================
// TRANSLATE VI → ZH (SAFE)
// ======================
exports.translateViToZh = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    return ApiRes.error(res, "Text is required", 400);
  }

  let chineseText = "";

  try {
    chineseText = await translateWithGemini(text, "models/gemini-2.5-flash");
  } catch {
    console.warn("⚠️ Gemini Flash overload → fallback Lite");
    try {
      chineseText = await translateWithGemini(
        text,
        "models/gemini-flash-lite-latest"
      );
    } catch {
      console.warn("⚠️ Gemini fail → fallback LibreTranslate");
      const libre = await axios.post(
        "https://libretranslate.com/translate",
        {
          q: text,
          source: "vi",
          target: "zh",
          format: "text",
        },
        { timeout: 8000 }
      );
      chineseText = libre.data.translatedText;
    }
  }

  if (!chineseText) {
    return ApiRes.error(res, "Translate service failed", 500);
  }

  // ✅ PINYIN (ĐÃ FIX)
  const pinyinText = pinyin(chineseText, {
    style: pinyin.STYLE_TONE,
  })
    .flat()
    .join(" ");

  return ApiRes.success(res, "Translate success", {
    sentences: [{ trans: chineseText }, { translit: pinyinText }],
  });
});
/**
 * ===================================================
 * DICTIONARY LOOKUP (MOCK – SAU NÀY GẮN DB)
 * ===================================================
 */
exports.lookupDictionary = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return ApiRes.error(res, "Text is required", 400);
  }

  return ApiRes.success(res, "Dictionary result", {
    tratu: [
      {
        fields: {
          word: text,
          fulltext: `
            <b>Pinyin:</b> cèshì<br/>
            <b>Nghĩa:</b> ví dụ từ điển HSK<br/>
            <b>HSK:</b> HSK1<br/>
            <b>Loại từ:</b> noun
          `,
        },
      },
    ],
  });
});
