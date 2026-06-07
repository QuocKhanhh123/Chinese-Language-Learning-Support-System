const examsModel = require('../Exam.model')

const ExamsRepo = {
  findById: (id) => examsModel.findById(id).populate('course').lean(),

  findByTagAndLevel: (tags, level) => ExamsRepo.queryExams({ tags, level }),

  getAll: () => examsModel.find().populate('course').lean(),

  create: (bodyData) => {
    // If courseId is provided but course is not, use courseId value
    if (bodyData.courseId && !bodyData.course) {
      bodyData.course = bodyData.courseId
      delete bodyData.courseId
    }
    return examsModel.create(bodyData)
  },

  update: async (exam_id, bodyUpdate, isNew = true) => {
    console.log('Update exam:', exam_id, bodyUpdate)

    // Convert courseId to course if needed
    if (bodyUpdate.courseId && !bodyUpdate.course) {
      bodyUpdate.course = bodyUpdate.courseId
      delete bodyUpdate.courseId
    }

    const updatedExam = await examsModel
      .findByIdAndUpdate(exam_id, bodyUpdate, { new: isNew })
      .populate('course')

    return updatedExam
  },

  delete: (exam_id) => examsModel.deleteOne({ _id: exam_id }),

  queryExams: (query) =>
    examsModel
      .find(query)
      .select('_id title description time_limit total_points level tags course startTime endTime')
      .populate('course')
      .lean(),

  // Find exam for taking (without answers)
  findForTaking: (id) =>
    examsModel
      .findById(id)
      .select(
        '_id title description time_limit total_points level sections tags questions difficultyLevel passingScore allowedAttempts course'
      )
      .populate('course')
      .lean()
      .then((exam) => {
        if (!exam) return null

        // Remove correct answers from questions
        if (exam.questions) {
          exam.questions = exam.questions.map((q) => ({
            ...q,
            correctAnswer: undefined
          }))
        }

        return exam
      }),

  // Find exam with answers for scoring
  findWithAnswers: (id) =>
    examsModel
      .findById(id)
      .select('_id title questions passingScore course level time_limit')
      .populate('course')
      .lean(),

  checkUserAccess: async (userId, examId) => {
    // Kiểm tra xem user có được phép làm bài thi này không
    const exam = await examsModel
      .findOne({
        _id: examId,
        $or: [{ allowedUsers: userId }, { creator: userId }]
      })
      .populate('course')
      .lean()

    return !!exam
  }
}

module.exports = ExamsRepo
