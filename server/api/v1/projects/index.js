const express = require('express');
const router = express.Router();
const projectController = require('./projects.controller');

router.post('/', projectController.create);
router.get('/:name', projectController.get);
router.get('/', projectController.list);
router.post('/:name/bids', projectController.bid);
router.get('/:name/bids', projectController.getBids);
router.post('/:name/events', projectController.handleEvent);


module.exports = router;
