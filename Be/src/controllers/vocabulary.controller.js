const Vocabulary = require("../models/Vocabulary.model");
const Course = require("../models/Course.model");
const Lesson = require("../models/Lesson.model");
const ApiRes = require("../res/apiRes");
const asyncHandler = require("../middleware/asyncHandler");
const {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} = require("../res/AppError");
const {
  createVocabularySchema,
  updateVocabularySchema,
} = require("../validators/vocabulary.validator");

const WHISPER_SERVICE_URL =
  process.env.WHISPER_SERVICE_URL || "http://127.0.0.1:8000/transcribe";

function normalizeChineseText(value = "") {
  return String(value)
    .normalize("NFKC")
    .replace(/[\s\p{P}\p{S}]+/gu, "")
    .trim();
}

function levenshteinDistance(a = "", b = "") {
  const m = a.length;
  const n = b.length;

  if (!m) return n;
  if (!n) return m;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

function calculateAccuracyScore(target, spoken) {
  const maxLength = Math.max(target.length, 1);
  const distance = levenshteinDistance(target, spoken);
  const rawScore = (1 - distance / maxLength) * 100;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  return score;
}

function resolvePronunciationBand(score) {
  if (score >= 85) return { band: "tot", bandLabel: "Tốt" };
  if (score >= 70) return { band: "kha", bandLabel: "Khá" };
  if (score >= 50) return { band: "dat_co_ban", bandLabel: "Đạt cơ bản" };
  return { band: "chua_dat", bandLabel: "Chưa đạt" };
}

function buildPronunciationDetails(target, spoken) {
  const targetChars = [...target];
  const spokenChars = [...spoken];
  const maxLength = Math.max(targetChars.length, spokenChars.length);
  const details = [];

  for (let i = 0; i < maxLength; i += 1) {
    const expected = targetChars[i] || "";
    const actual = spokenChars[i] || "";
    if (expected === actual) continue;

    let suggestion = "Cần điều chỉnh âm này cho rõ hơn.";
    if (expected && !actual) {
      suggestion = "Bạn bị thiếu âm này, hãy đọc chậm và rõ hơn.";
    } else if (!expected && actual) {
      suggestion = "Bạn đọc thừa âm này, cần tiết chế và đúng nhịp.";
    }

    details.push({
      char: expected || actual,
      expected,
      spoken: actual,
      suggestion,
      index: i,
    });
  }

  return details.slice(0, 20);
}

async function requestWhisperTranscript(file) {
  const fileType = file.mimetype || "audio/webm";
  const blob = new Blob([file.buffer], { type: fileType });
  const formData = new FormData();
  formData.append("audio", blob, file.originalname || "audio.webm");

  let response;
  try {
    response = await fetch(WHISPER_SERVICE_URL, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    throw new InternalServerError(
      "Khong ket noi duoc den Whisper service. Vui long kiem tra service dang chay.",
      { cause: error.message }
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new InternalServerError(
      data?.message || "Whisper service tra ve loi",
      data
    );
  }

  const transcript =
    data?.transcript || data?.text || data?.asr_text || data?.result || "";

  if (!String(transcript).trim()) {
    throw new InternalServerError(
      "Whisper service khong nhan dang duoc van ban tu audio"
    );
  }

  return {
    transcript: String(transcript).trim(),
    raw: data,
  };
}

exports.createVocabulary = asyncHandler(async (req, res) => {
  const { chinese, pinyin, vietnamese, example, level, wordType } = req.body;

  // A. Check trùng với từ hệ thống
  const existSystem = await Vocabulary.findOne({
    chinese,
    isSystem: true,
  });

  if (existSystem) {
    throw new Error("❌ Từ này đã có trong bộ từ vựng hệ thống");
  }

  // B. Check trùng với từ của teacher
  const existMine = await Vocabulary.findOne({
    chinese,
    createdBy: req.user.id,
  });

  if (existMine) {
    throw new Error("❌ Bạn đã thêm từ này trước đó");
  }

  const newVocabulary = await Vocabulary.create({
    chinese,
    pinyin,
    vietnamese,
    example,
    level,
    wordType,
    createdBy: req.user.id,
    isSystem: false,
  });

  return ApiRes.created(res, "Vocabulary created", newVocabulary);
});

exports.getMyVocabularies = asyncHandler(async (req, res) => {
  const { level, wordType } = req.query;

  const filter = {
    $or: [{ isSystem: true }, { createdBy: req.user.id }],
  };

  if (level) filter.level = level;
  if (wordType) filter.wordType = wordType;

  const vocab = await Vocabulary.find(filter).sort({ level: 1 });

  return ApiRes.success(res, "Vocabulary loaded", vocab);
});

exports.updateVocabulary = asyncHandler(async (req, res) => {
  const { vocabularyId } = req.params;
  const validatedData = updateVocabularySchema.parse(req.body);

  const vocabulary = await Vocabulary.findOne({
    _id: vocabularyId,
    createdBy: req.user.id,
  });
  if (!vocabulary) {
    throw new NotFoundError(
      "Vocabulary not found or you do not have permission"
    );
  }

  if (validatedData.courseId) {
    const course = await Course.findOne({
      _id: validatedData.courseId,
      assignedTeacher: req.user.id,
    });
    if (!course) {
      throw new NotFoundError("Course not found or you do not have permission");
    }
    validatedData.course = validatedData.courseId;
    delete validatedData.courseId;
  }

  if (validatedData.lessonId) {
    const lesson = await Lesson.findById(validatedData.lessonId);
    if (!lesson) {
      throw new NotFoundError("Lesson not found");
    }
    validatedData.lesson = validatedData.lessonId;
    delete validatedData.lessonId;
  }

  Object.assign(vocabulary, validatedData);
  await vocabulary.save();

  return ApiRes.updated(res, "Vocabulary updated successfully", vocabulary);
});

exports.getVocabularyById = asyncHandler(async (req, res) => {
  const { vocabularyId } = req.params;

  const vocabulary = await Vocabulary.findById(vocabularyId)
    .populate("course", "title targetLevel")
    .populate("lesson", "title order")
    .populate("createdBy", "fullName email")
    .lean();

  if (!vocabulary) {
    throw new NotFoundError("Vocabulary not found");
  }

  return ApiRes.success(res, "Vocabulary retrieved successfully", vocabulary);
});

exports.deleteVocabulary = asyncHandler(async (req, res) => {
  const { vocabularyId } = req.params;

  const vocabulary = await Vocabulary.findOneAndDelete({
    _id: vocabularyId,
    createdBy: req.user.id,
  });
  if (!vocabulary) {
    throw new NotFoundError(
      "Vocabulary not found or you do not have permission"
    );
  }

  return ApiRes.deleted(res, "Vocabulary deleted successfully");
});

exports.getStudentVocabularies = asyncHandler(async (req, res) => {
  const {
    level,
    wordType,
    courseId,
    lessonId,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};

  if (level) filter.level = level;
  if (wordType) filter.wordType = wordType;
  if (courseId) filter.course = courseId;
  if (lessonId) filter.lesson = lessonId;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [vocabularies, total] = await Promise.all([
    Vocabulary.find(filter)
      .sort({ createdAt: 1 }) // cho học sinh thì sort tăng dần (có thể chỉnh)
      .skip(skip)
      .limit(limitNum)
      .populate("course", "title")
      .populate("lesson", "title"),
    Vocabulary.countDocuments(filter),
  ]);

  return ApiRes.successWithMeta(
    res,
    "Student vocabularies retrieved successfully",
    vocabularies,
    {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum,
    }
  );
});

exports.evaluatePronunciation = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("Vui long gui file audio de cham phat am");
  }

  const targetRaw = req.body?.target_text || req.body?.targetText;
  if (!targetRaw || !String(targetRaw).trim()) {
    throw new BadRequestError("Vui long cung cap target_text de danh gia");
  }

  const target = normalizeChineseText(targetRaw);
  if (!target) {
    throw new BadRequestError("target_text khong hop le sau khi chuan hoa");
  }

  const { transcript } = await requestWhisperTranscript(req.file);
  const spoken = normalizeChineseText(transcript);
  const score = calculateAccuracyScore(target, spoken);
  const { band, bandLabel } = resolvePronunciationBand(score);
  const details = buildPronunciationDetails(target, spoken);

  return ApiRes.success(res, "Cham phat am thanh cong", {
    asr_text: transcript,
    normalized_target: target,
    normalized_asr_text: spoken,
    score,
    band,
    bandLabel,
    details,
    whisperServiceUrl: WHISPER_SERVICE_URL,
  });
});
