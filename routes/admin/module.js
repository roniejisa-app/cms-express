const express = require('express');
const { upload, createFolder } = require('@utils/uploadFile');
const router = express.Router();
const moduleController = require('@controllers/module.controller');
var csrf = require('csurf');
var csrfProtect = csrf({ cookie: true })

router.get('/:module',csrfProtect, moduleController.index);
router.post('/:module',csrfProtect, moduleController.handleAdd);
router.get('/:module/add',csrfProtect, moduleController.add);
// Phần này trả về api
router.post('/:module/filter',csrfProtect, moduleController.filter);
router.get('/:module/edit/:id',csrfProtect, moduleController.edit);
router.post('/:module/edit/:id',csrfProtect, moduleController.handleUpdate);
router.post('/:module/delete/:id',csrfProtect, moduleController.handleDelete);
router.post('/:module/delete-multiple',csrfProtect, moduleController.handleDeleteMulti);

//Excel
router.get("/:module/example/excel", moduleController.exampleExcel);
router.get("/:module/download/excel", moduleController.downloadExcel);
router.post("/:module/import-excel",upload.single('file'),moduleController.storeExcel);
module.exports = router;