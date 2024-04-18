var express = require('express');
const userController = require("../controllers/api/v1/user.controller");
var router = express.Router();
router.get("/v1/users", userController.index);
module.exports = router;