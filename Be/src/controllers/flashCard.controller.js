const Deck = require("../models/Deck.model");
const FlashCard = require("../models/FlashCard.model");
const ApiRes = require("../res/apiRes");
const asyncHandler = require("../middleware/asyncHandler");
const { NotFoundError, ForbiddenError } = require("../res/AppError");
const {
  createDeckSchema,
  updateDeckSchema,
  createFlashCardSchema,
  updateFlashCardSchema,
} = require("../validators/flashcard.validator");

exports.createDeck = asyncHandler(async (req, res) => {
  const validatedData = createDeckSchema.parse(req.body);
  const { title, description, tags, type } = validatedData;

  const newDeck = new Deck({
    title,
    description,
    tags,
    type,
    createdBy: req.user.id,
  });
  await newDeck.save();
  return ApiRes.created(res, "Deck created successfully", newDeck);
});

exports.updateDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;
  const validatedData = updateDeckSchema.parse(req.body);

  const deck = await Deck.findOneAndUpdate(
    { _id: deckId, createdBy: req.user.id },
    { ...validatedData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!deck) {
    throw new NotFoundError("Deck not found or you do not have permission");
  }

  return ApiRes.updated(res, "Deck updated successfully", deck);
});

exports.deleteDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;

  const deck = await Deck.findOneAndDelete({
    _id: deckId,
    createdBy: req.user.id,
  });
  if (!deck) {
    throw new NotFoundError("Deck not found or you do not have permission");
  }

  await FlashCard.deleteMany({ deck: deckId });

  return ApiRes.deleted(res, "Deck and all cards deleted successfully", {
    deletedDeckId: deckId,
  });
});

exports.getUserDecks = asyncHandler(async (req, res) => {
  const decks = await Deck.find({ createdBy: req.user.id }).sort({
    createdAt: -1,
  });
  return ApiRes.success(res, "Decks retrieved successfully", {
    decks,
    total: decks.length,
  });
});

exports.getDecks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const decks = await Deck.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Deck.countDocuments();
  return ApiRes.success(res, "Decks retrieved successfully", {
    decks,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

exports.createFlashCard = asyncHandler(async (req, res) => {
  const validatedData = createFlashCardSchema.parse(req.body);
  const { deckId, type, frontText, backText, vocabularyData, grammarData } =
    validatedData;

  const deck = await Deck.findOne({ _id: deckId, createdBy: req.user.id });
  if (!deck) {
    throw new NotFoundError("Deck not found or you do not have permission");
  }

  const newCard = new FlashCard({
    type,
    frontText,
    backText,
    vocabularyData,
    grammarData,
    deck: deckId,
  });
  await newCard.save();

  deck.stat.flashCardCount += 1;
  await deck.save();

  return ApiRes.created(res, "FlashCard created successfully", newCard);
});

exports.updateFlashCard = asyncHandler(async (req, res) => {
  const { flashCardId } = req.params;
  const validatedData = updateFlashCardSchema.parse(req.body);

  const card = await FlashCard.findById(flashCardId).populate("deck");
  if (!card) {
    throw new NotFoundError("FlashCard not found");
  }

  if (card.deck.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You do not have permission to update this card");
  }

  Object.assign(card, validatedData);
  await card.save();

  return ApiRes.updated(res, "FlashCard updated successfully", card);
});

exports.deleteFlashCard = asyncHandler(async (req, res) => {
  const { flashCardId } = req.params;

  const card = await FlashCard.findById(flashCardId).populate("deck");
  if (!card) {
    throw new NotFoundError("FlashCard not found");
  }

  if (card.deck.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You do not have permission to delete this card");
  }

  const deckId = card.deck._id;
  await card.deleteOne();

  await Deck.findByIdAndUpdate(deckId, { $inc: { "stat.flashCardCount": -1 } });

  return ApiRes.deleted(res, "FlashCard deleted successfully", {
    deletedCardId: flashCardId,
  });
});

exports.getFlashCardsByDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;

  const deck = await Deck.findById(deckId);
  if (!deck) {
    throw new NotFoundError("Deck not found");
  }

  const cards = await FlashCard.find({ deck: deckId }).sort({ createdAt: -1 });

  return ApiRes.success(res, "FlashCards retrieved successfully", {
    cards,
    total: cards.length,
    deck: {
      id: deck._id,
      title: deck.title,
      description: deck.description,
    },
  });
});

// LẤY DANH SÁCH DECK CHO STUDENT (có phân trang, search, filter)
exports.getStudentDecks = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, q, tag, type } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  if (limit > 50) limit = 50; // tránh query quá nặng

  const filter = {};

  if (q) {
    filter.title = { $regex: q, $options: "i" };
  }

  if (tag) {
    // nếu tags là array trong Deck, dùng match theo phần tử
    filter.tags = tag;
  }

  if (type) {
    filter.type = type;
  }

  const skip = (page - 1) * limit;

  const [decks, total] = await Promise.all([
    Deck.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Deck.countDocuments(filter),
  ]);

  return ApiRes.success(res, "Student decks retrieved successfully", {
    decks,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  });
});

// LẤY FLASHCARD THEO DECK CHO STUDENT
exports.getStudentFlashCardsByDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;

  // student chỉ cần deck tồn tại, không check createdBy
  const deck = await Deck.findById(deckId).populate("createdBy", "name email");
  if (!deck) {
    throw new NotFoundError("Deck not found");
  }

  const cards = await FlashCard.find({ deck: deckId }).sort({ createdAt: 1 });

  return ApiRes.success(res, "Student flashcards retrieved successfully", {
    deck: {
      id: deck._id,
      title: deck.title,
      description: deck.description,
      tags: deck.tags,
      type: deck.type,
      stat: deck.stat,
      createdBy: deck.createdBy,
    },
    cards,
    total: cards.length,
  });
});
