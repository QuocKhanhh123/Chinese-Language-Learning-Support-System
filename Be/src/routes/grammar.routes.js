const router = require('express').Router();
const grammarController = require('../controllers/grammar.controller');
const auth = require('../middleware/auth.middleware');
const { createGrammarSchema, updateGrammarSchema } = require('../validators/grammar.validator');
const { validateBody } = require('../middleware/validate');

router.post('/create', auth(['teacher']), validateBody(createGrammarSchema), grammarController.createGrammar);
router.get('/my-grammars', auth(['teacher']), grammarController.getMyGrammars);
router.get('/details/:grammarId', auth(['teacher', 'student']), grammarController.getGrammarById);
router.put('/update/:grammarId', auth(['teacher']), validateBody(updateGrammarSchema), grammarController.updateGrammar);
router.delete('/delete/:grammarId', auth(['teacher']), grammarController.deleteGrammar);

module.exports = router;