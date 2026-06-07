const path = require('path');
const fs = require('fs');
const ApiRes = require('../res/apiRes');
const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestError } = require('../res/AppError');

exports.uploadAudio = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new BadRequestError('No audio file uploaded');
    }
    
    return ApiRes.success(res, 'Audio uploaded successfully', {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: `/static/audio/${req.file.filename}`
    });
});

exports.uploadMultipleAudios = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new BadRequestError('No audio files uploaded');
    }
    
    const files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/static/audio/${file.filename}`
    }));
    
    return ApiRes.success(res, `${files.length} audio files uploaded successfully`, files);
});

exports.getAudioFiles = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    const uploadPath = path.join(__dirname, '../../uploads/audio');
    
    if (!fs.existsSync(uploadPath)) {
        return ApiRes.successWithMeta(res, 'Lấy danh sách file thành công', [], {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0
        });
    }
    
    let files = fs.readdirSync(uploadPath);
    
    // Filter by search term
    if (search) {
        files = files.filter(file => 
            file.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Get file stats and sort by creation time (newest first)
    const filesWithStats = files.map(filename => {
        const filePath = path.join(uploadPath, filename);
        const stats = fs.statSync(filePath);
        return {
            filename,
            url: `/static/audio/${filename}`,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
        };
    }).sort((a, b) => b.createdAt - a.createdAt);
    
    // Pagination
    const total = filesWithStats.length;
    const totalPages = Math.ceil(total / parseInt(limit));
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedFiles = filesWithStats.slice(skip, skip + parseInt(limit));
    
    return ApiRes.successWithMeta(res, 'Lấy danh sách file thành công', paginatedFiles, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
    });
});

exports.getAudioFileInfo = asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/audio', filename);
    
    if (!fs.existsSync(filePath)) {
        throw new BadRequestError('File không tồn tại');
    }
    
    const stats = fs.statSync(filePath);
    
    return ApiRes.success(res, 'Lấy thông tin file thành công', {
        filename,
        url: `/static/audio/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
    });
});

exports.deleteAudioFile = asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/audio', filename);
    
    if (!fs.existsSync(filePath)) {
        throw new BadRequestError('File không tồn tại');
    }
    
    fs.unlinkSync(filePath);
    
    return ApiRes.success(res, 'Xóa file thành công', { filename });
});

// ========== IMAGE UPLOAD CONTROLLERS ==========

exports.uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new BadRequestError('No image file uploaded');
    }
    
    return ApiRes.success(res, 'Image uploaded successfully', {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: `/static/images/${req.file.filename}`
    });
});

exports.uploadMultipleImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new BadRequestError('No image files uploaded');
    }
    
    const files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/static/images/${file.filename}`
    }));
    
    return ApiRes.success(res, `${files.length} image files uploaded successfully`, files);
});

exports.getImageFiles = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    const uploadPath = path.join(__dirname, '../../uploads/images');
    
    if (!fs.existsSync(uploadPath)) {
        return ApiRes.successWithMeta(res, 'Lấy danh sách ảnh thành công', [], {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0
        });
    }
    
    let files = fs.readdirSync(uploadPath);
    
    // Filter by search term
    if (search) {
        files = files.filter(file => 
            file.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Get file stats and sort by creation time (newest first)
    const filesWithStats = files.map(filename => {
        const filePath = path.join(uploadPath, filename);
        const stats = fs.statSync(filePath);
        return {
            filename,
            url: `/static/images/${filename}`,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
        };
    }).sort((a, b) => b.createdAt - a.createdAt);
    
    // Pagination
    const total = filesWithStats.length;
    const totalPages = Math.ceil(total / parseInt(limit));
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedFiles = filesWithStats.slice(skip, skip + parseInt(limit));
    
    return ApiRes.successWithMeta(res, 'Lấy danh sách ảnh thành công', paginatedFiles, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
    });
});

exports.getImageFileInfo = asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/images', filename);
    
    if (!fs.existsSync(filePath)) {
        throw new BadRequestError('File không tồn tại');
    }
    
    const stats = fs.statSync(filePath);
    
    return ApiRes.success(res, 'Lấy thông tin ảnh thành công', {
        filename,
        url: `/static/images/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
    });
});

exports.deleteImageFile = asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/images', filename);
    
    if (!fs.existsSync(filePath)) {
        throw new BadRequestError('File không tồn tại');
    }
    
    fs.unlinkSync(filePath);
    
    return ApiRes.success(res, 'Xóa ảnh thành công', { filename });
});
