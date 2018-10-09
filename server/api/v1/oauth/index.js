const express = require('express');
const router = express.Router();
const oauthController = require('./oauth.controller');

router.get('/', oauthController.redirect);
router.get('/callback', oauthController.callback);
router.post('/logout', oauthController.logout);

module.exports = router;