const express = require('express');
const router = express.Router();
const projectController = require('./projects.controller');

router.post('/', projectController.create);
router.get('/:pName', projectController.get);
router.get('/', projectController.list);
router.post('/:name/bid', projectController.bid);


module.exports = router;
