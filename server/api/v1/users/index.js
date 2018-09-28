const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

router.get('/:username/balance', userController.getBalance);
router.post('/create', userController.create);


module.exports = router;
