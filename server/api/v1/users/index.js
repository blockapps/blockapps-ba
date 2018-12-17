const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

router.get('/:address', userController.get);
router.get('/:address/balance', userController.getBalance);

module.exports = router;
