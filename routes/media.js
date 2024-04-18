const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { upload, createFolder } = require('../utils/uploadFile');
router.get('/trash', mediaController.trash);
router.post('/add/folder', mediaController.addFolder);
router.post('/edit/folder/:id', mediaController.editFolder);
router.post('/delete/:id', mediaController.delete);
router.post('/delete-all', mediaController.deleteAll);
router.post('/delete-force', mediaController.deleteForce);
router.post('/restore-all', mediaController.restore);
router.post('/add/file', upload.array('files', 50), mediaController.addFile);
router.get('/folder/*', mediaController.getFolder);
router.patch('/edit-file/:id', mediaController.editFile);
router.get('/test-folder', function () {
    var data = createFolder('Sản phẩm 1/Sản phẩm 2/ Sản phẩm 3');
})
router.get('/', mediaController.index);
router.get('/*', mediaController.index);
module.exports = router;