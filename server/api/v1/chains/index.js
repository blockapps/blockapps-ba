const express = require('express');
const router = express.Router();
const chainsController = require('./chains.controller');

router.post('/', chainsController.create);
router.get('/', chainsController.get);

module.exports = router;
