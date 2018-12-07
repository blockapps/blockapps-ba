const express = require('express');
const router = express.Router();
const authenticationController = require('./authentication.controller');

/**
 * route for oauth flow
 */
router.get('/oauth', authenticationController.redirect);
router.get('/callback', authenticationController.callback);
router.get('/logout', authenticationController.logout);

module.exports = router;
