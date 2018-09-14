const express = require('express');
const router = express.Router();
const uploadContractsController = require('./uploadContract.controller');

router.post('/', uploadContractsController.uploadContract);

module.exports = router;
