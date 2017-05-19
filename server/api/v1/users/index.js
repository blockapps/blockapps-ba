const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

router.get('/:username/balance', userController.getBalance);


module.exports = router;
