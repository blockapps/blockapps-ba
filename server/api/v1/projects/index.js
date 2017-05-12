const express = require('express');
const router = express.Router();
const projectController = require('./projects.controller');

router.post('/', projectController.create);
router.get('/', projectController.list);

module.exports = router;
