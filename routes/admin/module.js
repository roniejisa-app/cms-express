const express = require('express');
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

module.exports = router;