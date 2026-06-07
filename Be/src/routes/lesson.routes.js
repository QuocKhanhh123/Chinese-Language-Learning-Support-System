

const express = require('express');
const auth = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate');

const lessonController = require('../controllers/lesson.controller');
const { 
    createLessonSchema, 
    updateLessonSchema, 
    deleteLessonSchema,
    addVocabulariesSchema,
    removeVocabulariesSchema,
    updateVocabularySchema,
    addGrammarsSchema,
    removeGrammarsSchema,
    updateGrammarSchema
} = require("../validators/lesson.validator");
const router = express.Router();

router.post('/create-lesson', auth(["teacher"]), validateBody(createLessonSchema), lessonController.createLesson);
router.put('/update-lesson/:lessonId', auth(["teacher"]), validateBody(updateLessonSchema), lessonController.updateLesson);
router.delete('/delete-lesson/:lessonId', auth(["teacher"]), lessonController.deleteLesson);
router.post('/add-lesson-vocabularies/:lessonId', auth(["teacher"]), validateBody(addVocabulariesSchema), lessonController.addVocabularies);
router.post('/remove-vocabularies/:lessonId', auth(["teacher"]), validateBody(removeVocabulariesSchema), lessonController.removeVocabularies);
router.put('/:lessonId/vocabularies/:vocabularyId', auth(["teacher"]), validateBody(updateVocabularySchema), lessonController.updateVocabulary);
router.post('/add-grammars/:lessonId', auth(["teacher"]), validateBody(addGrammarsSchema), lessonController.addGrammars);
router.post('/remove-grammars/:lessonId', auth(["teacher"]), validateBody(removeGrammarsSchema), lessonController.removeGrammars);
router.put('/:lessonId/grammars/:grammarId', auth(["teacher"]), validateBody(updateGrammarSchema), lessonController.updateGrammar);
router.get('/get-lessons-in-course/:courseId', auth(["teacher", "student"]), lessonController.getLessonsByCourse);
router.get('/get-lesson/:lessonId', auth(["teacher", "student"]), lessonController.getLessonById);
router.get('/:lessonId/vocabularies', auth(["teacher", "student"]), lessonController.getLessonVocabularies);
router.get('/:lessonId/grammars', auth(["teacher", "student"]), lessonController.getLessonGrammars);

module.exports = router;