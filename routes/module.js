const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/module.controller');

router.get('/:module', moduleController.index);
router.post('/:module', moduleController.handleAdd);
router.get('/:module/add', moduleController.add);
// Phần này trả về api
router.post('/:module/filter', moduleController.filter);
router.get('/:module/edit/:id', moduleController.edit);
router.post('/:module/edit/:id', moduleController.handleUpdate);
router.post('/:module/delete/:id', moduleController.handleDelete);

module.exports = router;