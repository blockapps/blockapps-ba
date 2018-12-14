const express = require('express');
const router = express.Router();
const loginController = require('./login.controller');

router.post('/', loginController.login);
router.get('/getUser', loginController.getUser);

module.exports = router;
