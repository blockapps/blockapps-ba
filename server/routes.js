const routes = require('express').Router();
const heartbeat = require('./api/v1/heartbeat');
const projects = require('./api/v1/projects');
const users = require('./api/v1/users');
const oauth = require('./api/v1/oauth');
const ba = require('blockapps-rest');
const common = ba.common;
const oauthConfig = common.config.oauth;
const APP_TOKEN_COOKIE_NAME = oauthConfig.appTokenCookieName;

const cookieParser = require('cookie-parser');
routes.use(cookieParser());

routes.use('/api/v1/heartbeat', heartbeat);
routes.use('/api/v1/projects', validateCookie(), projects);
routes.use('/api/v1/users', validateCookie(), users);

/**
 * Api for OAuth flow
 */
routes.use('/api/v1/oauth', oauth);

/**
 * Serve the docs for the api
 */
// const path = require('path');
// routes.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname + '/../doc/index.html'));
// });

function validateCookie(req, res, next) {
  return function (req, res, next) {
    let cookie = req.cookies[APP_TOKEN_COOKIE_NAME];
    if (!cookie) {
      res.redirect({url: '/oauth'});
    } else {
      // TODO: validate JWT with signature
      // TODO: check if token is outdated and refresh from OAUTH Provider if needed
      return next();
    }
  }
}

module.exports = routes;
