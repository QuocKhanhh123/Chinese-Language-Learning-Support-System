const express = require('express')
const router = express.Router()
const ExamController = require('../controllers/exam.controller')
const { authenticateJWT } = require('../middleware/auth.middleware')

const auth = require('../middleware/auth.middleware');
/**
 * Public routes (accessible without authentication)
 */
// Get list of available (published) exams
router.get('', ExamController.getExams)
router.get('/:exam_id', ExamController.getExamDetails)
router.post('/create-exam', auth(["admin", "teacher"]), ExamController.createExam)
router.delete('/:id', auth(["admin", "teacher"]), ExamController.deleteExam)



module.exports = router
