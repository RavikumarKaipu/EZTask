const express = require('express');
const multer = require('multer');
const { uploadFile, listFiles, downloadFile } = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/list-files', authMiddleware, listFiles);
router.get('/download-file/:file_id', authMiddleware, downloadFile);

module.exports = router;
