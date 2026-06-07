const Lesson = require("../models/Lesson.model");
const Course = require("../models/Course.model");
const Vocabulary = require("../models/Vocabulary.model");
const Grammar = require("../models/Grammar.model");
const ApiRes = require('../res/apiRes');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../res/AppError');
const { createLessonSchema, updateLessonSchema } = require("../validators/lesson.validator");

exports.createLesson = asyncHandler(async (req, res) => {
    const validatedData = createLessonSchema.parse(req.body);
    const { courseId, title, description, content, order, video_url, status } = validatedData;
    
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Không tìm thấy khóa học');
    }
    
    if (course.assignedTeacher.toString() !== req.user.id) {
        throw new ForbiddenError('Bạn không phải giáo viên được phân công cho khóa học này');
    }

    const existing = await Lesson.findOne({ course: courseId, order });
    if (existing) {
        throw new BadRequestError('Một bài học với thứ tự này đã tồn tại trong khóa học');
    }

    const lesson = await Lesson.create({
        course: courseId,
        teacher: req.user.id,
        title,
        description,
        content,
        order,
        video_url,
        status: status || 'active'
    });
    
    await Course.findByIdAndUpdate(courseId, { $inc: { 'stats.lessonCount': 1 } });
    
    return ApiRes.created(res, 'Tạo bài học thành công', lesson);
});

exports.updateLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const validatedData = updateLessonSchema.parse(req.body);
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    if (lesson.teacher.toString() !== req.user.id) {
        throw new ForbiddenError('Bạn không phải giáo viên được phân công cho bài học này');
    }
    
    // Check duplicate order if updating order
    if (validatedData.order && validatedData.order !== lesson.order) {
        const existing = await Lesson.findOne({ 
            course: lesson.course, 
            order: validatedData.order,
            _id: { $ne: lessonId }
        });
        if (existing) {
            throw new BadRequestError('Một bài học với thứ tự này đã tồn tại trong khóa học');
        }
    }
    
    const allowedFields = ['title', 'description', 'content', 'order', 'video_url', 'status'];
    allowedFields.forEach(field => {
        if (validatedData[field] !== undefined) {
            lesson[field] = validatedData[field];
        }
    });
    
    await lesson.save();
    
    return ApiRes.updated(res, 'Cập nhật bài học thành công', lesson);
});

exports.deleteLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    if (lesson.teacher.toString() !== req.user.id) {
        throw new ForbiddenError('Bạn không phải giáo viên được phân công cho bài học này');
    }
    
    // Delete associated data in parallel
    await Promise.all([
        Lesson.findByIdAndDelete(lessonId),
        Vocabulary.deleteMany({ lesson: lessonId }),
        Grammar.deleteMany({ lesson: lessonId }),
        Course.findByIdAndUpdate(lesson.course, { $inc: { 'stats.lessonCount': -1 } })
    ]);
    
    return ApiRes.deleted(res, 'Xóa bài học và dữ liệu liên quan thành công');
});

exports.getLessonsByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    const course = await Course.findById(courseId);
    if (!course) {
        throw new NotFoundError('Không tìm thấy khóa học');
    }
    
    const filter = { course: courseId };
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [lessons, total] = await Promise.all([
        Lesson.find(filter)
            .sort({ order: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('teacher', 'name email')
            .lean(),
        Lesson.countDocuments(filter)
    ]);
    
    return ApiRes.successWithMeta(res, 'Lấy danh sách bài học thành công', lessons, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
    });
});

exports.getLessonById = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId)
        .populate('course', 'title targetLevel')
        .populate('teacher', 'name email')
        .lean();
    
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    const vocabularies = (lesson.contents && lesson.contents.vocabulary) ? lesson.contents.vocabulary : [];
    const grammars = (lesson.contents && lesson.contents.grammar) ? lesson.contents.grammar : [];

    // counts
    const vocabCount = vocabularies.length;
    const grammarCount = grammars.length;

    const [prevLesson, nextLesson] = await Promise.all([
        Lesson.findOne({ course: lesson.course._id, order: { $lt: lesson.order } })
            .sort({ order: -1 })
            .select('title order')
            .lean(),
        Lesson.findOne({ course: lesson.course._id, order: { $gt: lesson.order } })
            .sort({ order: 1 })
            .select('title order')
            .lean()
    ]);

    let isEnrolled = false;
    try {
        if (req.user && req.user.role === 'student') {
            const Enrollment = require('../models/Enrollment.model');
            const enrollment = await Enrollment.findOne({ user: req.user.id, course: lesson.course._id });
            isEnrolled = !!enrollment;
        } else if (req.user && req.user.role === 'teacher') {
            isEnrolled = (lesson.course.assignedTeacher && lesson.course.assignedTeacher.toString() === req.user.id) || false;
        } else {
            isEnrolled = false;
        }
    } catch (err) {
        isEnrolled = false;
    }

    const payload = Object.assign({}, lesson, {
        content: lesson.content || '',
        contents: lesson.contents || { vocabulary: [], grammar: [] },
        counts: {
            vocabulary: vocabCount,
            grammar: grammarCount
        },
        prevLesson: prevLesson ? { _id: prevLesson._id, title: prevLesson.title, order: prevLesson.order } : null,
        nextLesson: nextLesson ? { _id: nextLesson._id, title: nextLesson.title, order: nextLesson.order } : null,
        isEnrolled
    });

    return ApiRes.success(res, 'Lấy bài học thành công', payload);
});

exports.getLessonVocabularies = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    const vocabularies = lesson.contents.vocabulary || [];
    const total = vocabularies.length;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedVocabs = vocabularies.slice(skip, skip + parseInt(limit));
    
    return ApiRes.successWithMeta(res, 'Lấy danh sách từ vựng thành công', paginatedVocabs, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
    });
});

exports.getLessonGrammars = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    const grammars = lesson.contents.grammar || [];
    const total = grammars.length;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedGrammars = grammars.slice(skip, skip + parseInt(limit));
    
    return ApiRes.successWithMeta(res, 'Lấy danh sách ngữ pháp thành công', paginatedGrammars, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
    });
});

// Add vocabularies to lesson
exports.addVocabularies = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { vocabularies } = req.body; // Array of vocabulary objects
    
    if (!Array.isArray(vocabularies) || vocabularies.length === 0) {
        throw new BadRequestError('vocabularies phải là một mảng không rỗng');
    }
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    if (lesson.teacher.toString() !== req.user.id) {
        throw new ForbiddenError('Bạn không phải giáo viên được phân công cho bài học này');
    }
    
    // Check for duplicates by chinese word
    const existingWords = new Set(lesson.contents.vocabulary.map(v => v.chinese));
    const newVocabs = vocabularies.filter(v => !existingWords.has(v.chinese));
    
    if (newVocabs.length > 0) {
        lesson.contents.vocabulary.push(...newVocabs);
        await lesson.save();
    }
    
    return ApiRes.success(res, `Đã thêm ${newVocabs.length} từ vựng vào bài học`, {
        addedCount: newVocabs.length,
        totalCount: lesson.contents.vocabulary.length
    });
});

// Remove vocabularies from lesson
exports.removeVocabularies = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { vocabularyIds } = req.body; // Array of vocabulary _ids to remove
    
    if (!Array.isArray(vocabularyIds) || vocabularyIds.length === 0) {
        throw new BadRequestError('vocabularyIds phải là một mảng không rỗng');
    }
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    if (lesson.teacher.toString() !== req.user.id) {
        throw new ForbiddenError('Bạn không phải giáo viên được phân công cho bài học này');
    }
    
    const idsToRemove = new Set(vocabularyIds.map(id => id.toString()));
    const originalCount = lesson.contents.vocabulary.length;
    
    lesson.contents.vocabulary = lesson.contents.vocabulary.filter(
        v => !idsToRemove.has(v._id.toString())
    );
    
    const removedCount = originalCount - lesson.contents.vocabulary.length;
    await lesson.save();
    
    return ApiRes.success(res, `Đã xóa ${removedCount} từ vựng khỏi bài học`, {
        removedCount,
        remainingCount: lesson.contents.vocabulary.length
    });
});

// Add grammars to lesson
exports.addGrammars = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { grammars } = req.body; // Array of grammar objects
    
    if (!Array.isArray(grammars) || grammars.length === 0) {
        throw new BadRequestError('grammars phải là một mảng không rỗng');
    }
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    if (lesson.teacher.toString() !== req.user.id) {
        throw new ForbiddenError('Bạn không phải giáo viên được phân công cho bài học này');
    }
    
    // Check for duplicates by title
    const existingTitles = new Set(lesson.contents.grammar.map(g => g.title));
    const newGrammars = grammars.filter(g => !existingTitles.has(g.title));
    
    if (newGrammars.length > 0) {
        lesson.contents.grammar.push(...newGrammars);
        await lesson.save();
    }
    
    return ApiRes.success(res, `Đã thêm ${newGrammars.length} ngữ pháp vào bài học`, {
        addedCount: newGrammars.length,
        totalCount: lesson.contents.grammar.length
    });
});

// Remove grammars from lesson
exports.removeGrammars = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { grammarIds } = req.body; // Array of grammar _ids to remove
    
    if (!Array.isArray(grammarIds) || grammarIds.length === 0) {
        throw new BadRequestError('grammarIds phải là một mảng không rỗng');
    }
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    if (lesson.teacher.toString() !== req.user.id) {
        throw new ForbiddenError('Bạn không phải giáo viên được phân công cho bài học này');
    }
    
    const idsToRemove = new Set(grammarIds.map(id => id.toString()));
    const originalCount = lesson.contents.grammar.length;
    
    lesson.contents.grammar = lesson.contents.grammar.filter(
        g => !idsToRemove.has(g._id.toString())
    );
    
    const removedCount = originalCount - lesson.contents.grammar.length;
    await lesson.save();
    
    return ApiRes.success(res, `Đã xóa ${removedCount} ngữ pháp khỏi bài học`, {
        removedCount,
        remainingCount: lesson.contents.grammar.length
    });
});

// Update vocabulary in lesson
exports.updateVocabulary = asyncHandler(async (req, res) => {
    const { lessonId, vocabularyId } = req.params;
    const updateData = req.body;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    if (lesson.teacher.toString() !== req.user.id) {
        throw new ForbiddenError('Bạn không phải giáo viên được phân công cho bài học này');
    }
    
    const vocabIndex = lesson.contents.vocabulary.findIndex(v => v._id.toString() === vocabularyId);
    if (vocabIndex === -1) {
        throw new NotFoundError('Không tìm thấy từ vựng trong bài học');
    }
    
    // Update fields
    const allowedFields = ['chinese', 'pinyin', 'vietnamese', 'audioUrl', 'example', 'note', 'level', 'wordType'];
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            lesson.contents.vocabulary[vocabIndex][field] = updateData[field];
        }
    });
    
    await lesson.save();
    
    return ApiRes.success(res, 'Cập nhật từ vựng thành công', lesson.contents.vocabulary[vocabIndex]);
});

exports.updateGrammar = asyncHandler(async (req, res) => {
    const { lessonId, grammarId } = req.params;
    const updateData = req.body;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new NotFoundError('Không tìm thấy bài học');
    }
    
    if (lesson.teacher.toString() !== req.user.id) {
        throw new ForbiddenError('Bạn không phải giáo viên được phân công cho bài học này');
    }
    
    const grammarIndex = lesson.contents.grammar.findIndex(g => g._id.toString() === grammarId);
    if (grammarIndex === -1) {
        throw new NotFoundError('Không tìm thấy ngữ pháp trong bài học');
    }
    
    // Update fields
    const allowedFields = ['title', 'structure', 'explanation', 'examples', 'note', 'level'];
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            lesson.contents.grammar[grammarIndex][field] = updateData[field];
        }
    });
    
    await lesson.save();
    
    return ApiRes.success(res, 'Cập nhật ngữ pháp thành công', lesson.contents.grammar[grammarIndex]);
});
