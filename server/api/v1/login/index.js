const express = require('express');
const router = express.Router();
const loginController = require('./login.controller');

router.post('/', loginController.login);

module.exports = router;
