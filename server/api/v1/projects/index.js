const express = require('express');
const router = express.Router();
const projectController = require('./projects.controller');

router.post('/', projectController.create);

module.exports = router;
