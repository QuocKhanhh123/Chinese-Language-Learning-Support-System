const router = require("express").Router();
const multer = require("multer");
const vocabularyController = require("../controllers/vocabulary.controller");
const auth = require("../middleware/auth.middleware");
const { BadRequestError } = require("../res/AppError");
const {
  createVocabularySchema,
  updateVocabularySchema,
} = require("../validators/vocabulary.validator");
const { validateBody } = require("../middleware/validate");

const pronunciationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "audio/webm",
      "audio/wav",
      "audio/x-wav",
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/m4a",
      "audio/ogg",
    ];
    const isAllowed = allowedMimes.includes(file.mimetype);
    if (!isAllowed) {
      return cb(
        new BadRequestError(
          "Audio khong hop le. Ho tro webm, wav, mp3, m4a, ogg"
        )
      );
    }
    return cb(null, true);
  },
});

router.post(
  "/create",
  auth(["teacher"]),
  validateBody(createVocabularySchema),
  vocabularyController.createVocabulary
);
router.get(
  "/my-vocabularies",
  auth(["teacher"]),
  vocabularyController.getMyVocabularies
);
router.get(
  "/details/:vocabularyId",
  auth(["teacher", "student"]),
  vocabularyController.getVocabularyById
);
router.put(
  "/update/:vocabularyId",
  auth(["teacher"]),
  validateBody(updateVocabularySchema),
  vocabularyController.updateVocabulary
);
router.delete(
  "/delete/:vocabularyId",
  auth(["teacher"]),
  vocabularyController.deleteVocabulary
);
router.get(
  "/student/list",
  auth(["teacher", "student"]),
  vocabularyController.getStudentVocabularies
);
router.post(
  "/pronunciation/evaluate",
  auth(["student", "teacher"]),
  pronunciationUpload.single("audio"),
  vocabularyController.evaluatePronunciation
);
``;
module.exports = router;
