const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth.middleware');
const uploadController = require('../controllers/upload.controller');
const { BadRequestError } = require('../res/AppError');

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/audio');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const audioFileFilter = (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|ogg|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        return cb(null, true);
    } else {
        cb(new BadRequestError('Only audio files are allowed (mp3, wav, m4a, ogg, webm)'));
    }
};

const uploadAudio = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max
    },
    fileFilter: audioFileFilter
});

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/images');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp|svg\+xml)/.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new BadRequestError('Only image files are allowed (jpg, jpeg, png, gif, webp, svg)'));
    }
};

const uploadImage = multer({
    storage: imageStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: imageFileFilter
});

// Audio upload routes
router.post('/upload-audio', auth(['teacher']), uploadAudio.single('audio'), uploadController.uploadAudio);
router.post('/upload-audios', auth(['teacher']), uploadAudio.array('audios', 20), uploadController.uploadMultipleAudios);

// Image upload routes
router.post('/upload-image', auth(['teacher', 'admin']), uploadImage.single('image'), uploadController.uploadImage);
router.post('/upload-images', auth(['teacher', 'admin']), uploadImage.array('images', 20), uploadController.uploadMultipleImages);

// File management routes - Audio
// router.get('/audio-files', auth(['teacher', 'admin']), uploadController.getAudioFiles);
// router.get('/audio-files/:filename', auth(['teacher', 'admin']), uploadController.getAudioFileInfo);
// router.delete('/audio-files/:filename', auth(['teacher', 'admin']), uploadController.deleteAudioFile);

// File management routes - Images
// router.get('/image-files', auth(['teacher', 'admin']), uploadController.getImageFiles);
// router.get('/image-files/:filename', auth(['teacher', 'admin']), uploadController.getImageFileInfo);
// router.delete('/image-files/:filename', auth(['teacher', 'admin']), uploadController.deleteImageFile);

module.exports = router;

