const express = require('express');
const router = express.Router();
const controller = require('./me.controller');

router.get('/', controller.get);

module.exports = router;
