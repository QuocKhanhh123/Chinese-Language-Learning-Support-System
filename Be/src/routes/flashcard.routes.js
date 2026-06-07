const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validate");

const flashcardController = require("../controllers/flashCard.controller");
const {
  createDeckSchema,
  updateDeckSchema,
  createFlashCardSchema,
  updateFlashCardSchema,
} = require("../validators/flashcard.validator");

router.get("/get-decks", flashcardController.getDecks);

router.post(
  "/decks/create",
  auth(["teacher"]),
  validateBody(createDeckSchema),
  flashcardController.createDeck
);
router.put(
  "/decks/update/:deckId",
  auth(["teacher"]),
  validateBody(updateDeckSchema),
  flashcardController.updateDeck
);
router.delete(
  "/decks/delete/:deckId",
  auth(["teacher"]),
  flashcardController.deleteDeck
);
router.get("/decks", auth(["teacher"]), flashcardController.getUserDecks);

router.post(
  "/flashcards/create",
  auth(["teacher"]),
  validateBody(createFlashCardSchema),
  flashcardController.createFlashCard
);
router.put(
  "/flashcards/update/:flashCardId",
  auth(["teacher"]),
  validateBody(updateFlashCardSchema),
  flashcardController.updateFlashCard
);
router.delete(
  "/flashcards/delete/:flashCardId",
  auth(["teacher"]),
  flashcardController.deleteFlashCard
);
router.get(
  "/flashcards/deck/:deckId",
  auth(["teacher"]),
  flashcardController.getFlashCardsByDeck
);
router.get(
  "/student/decks",
  auth(["student", "teacher"]), // nếu muốn public thì bỏ auth
  flashcardController.getStudentDecks
);

router.get(
  "/student/decks/:deckId/flashcards",
  auth(["student", "teacher"]),
  flashcardController.getStudentFlashCardsByDeck
);

module.exports = router;
