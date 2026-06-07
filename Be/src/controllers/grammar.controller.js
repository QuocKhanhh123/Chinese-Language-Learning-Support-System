const Grammar = require('../models/Grammar.model');
const Course = require('../models/Course.model');
const Lesson = require('../models/Lesson.model');
const ApiRes = require('../res/apiRes');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError, ForbiddenError } = require('../res/AppError');
const { createGrammarSchema, updateGrammarSchema } = require('../validators/grammar.validator');

exports.createGrammar = asyncHandler(async (req, res) => {
    const validatedData = createGrammarSchema.parse(req.body);
    const { title, structure, explanation, examples, note, level, courseId, lessonId } = validatedData;
    
    if (courseId) {
        const course = await Course.findOne({ _id: courseId, assignedTeacher: req.user.id });
        if (!course) {
            throw new NotFoundError('Course not found or you do not have permission');
        }
    }
    
    if (lessonId) {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            throw new NotFoundError('Lesson not found');
        }
    }
    
    const newGrammar = new Grammar({ 
        title, 
        structure, 
        explanation,
        examples, 
        note,
        level,
        course: courseId,
        lesson: lessonId,
        createdBy: req.user.id 
    });
    await newGrammar.save();
    
    return ApiRes.created(res, "Grammar created successfully", newGrammar);
});

exports.getMyGrammars = asyncHandler(async (req, res) => {
    const { level, wordType, page = 1, limit = 20 } = req.query;
    const filter = { createdBy: req.user.id };
    
    if (level) filter.level = level;
    if (wordType) filter.wordType = wordType;
    
    const skip = (page - 1) * limit;
    const grammars = await Grammar.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('course', 'title')
        .populate('lesson', 'title');
    
    const total = await Grammar.countDocuments(filter);
    
    return ApiRes.successWithMeta(res, "Grammars retrieved successfully", grammars, {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
    });
});

exports.updateGrammar = asyncHandler(async (req, res) => {
    const { grammarId } = req.params;
    const validatedData = updateGrammarSchema.parse(req.body);
    
    const grammar = await Grammar.findOne({ _id: grammarId, createdBy: req.user.id });
    if (!grammar) {
        throw new NotFoundError('Grammar not found or you do not have permission');
    }
    
    if (validatedData.courseId) {
        const course = await Course.findOne({ _id: validatedData.courseId, assignedTeacher: req.user.id });
        if (!course) {
            throw new NotFoundError('Course not found or you do not have permission');
        }
        validatedData.course = validatedData.courseId;
        delete validatedData.courseId;
    }
    
    if (validatedData.lessonId) {
        const lesson = await Lesson.findById(validatedData.lessonId);
        if (!lesson) {
            throw new NotFoundError('Lesson not found');
        }
        validatedData.lesson = validatedData.lessonId;
        delete validatedData.lessonId;
    }
    
    Object.assign(grammar, validatedData);
    await grammar.save();
    
    return ApiRes.updated(res, "Grammar updated successfully", grammar);
});

exports.getGrammarById = asyncHandler(async (req, res) => {
    const { grammarId } = req.params;
    
    const grammar = await Grammar.findById(grammarId)
        .populate('course', 'title targetLevel')
        .populate('lesson', 'title order')
        .populate('createdBy', 'fullName email')
        .lean();
    
    if (!grammar) {
        throw new NotFoundError('Grammar not found');
    }
    
    return ApiRes.success(res, 'Grammar retrieved successfully', grammar);
});

exports.deleteGrammar = asyncHandler(async (req, res) => {
    const { grammarId } = req.params;
    
    const grammar = await Grammar.findOneAndDelete({ _id: grammarId, createdBy: req.user.id });
    if (!grammar) {
        throw new NotFoundError('Grammar not found or you do not have permission');
    }
    
    return ApiRes.deleted(res, "Grammar deleted successfully");
});