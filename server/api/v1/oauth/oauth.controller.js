const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const util = common.util;
const oauth = common.oauth;
const oauthConfig = common.config.oauth;

const APP_TOKEN_COOKIE_NAME = oauthConfig.appTokenCookieName;

const oauthController = {

  redirect: async function (req, res) {
    try {
      const authorizationUri = await oauth.oauthGetSigninURL();
      util.response.status200(res, {url: authorizationUri});
    } catch (error) {
      util.response.status500(res, 'Something went wrong with authorization uri: ' + error);
    }
  },

  callback: async function (req, res) {

    try {
      const accessTokenResponse = await oauth.oauthGetAccessTokenByAuthCode(req.query['code']);
      res.cookie(APP_TOKEN_COOKIE_NAME, accessTokenResponse.token['access_token'], {maxAge: 900000, httpOnly: false});
      res.redirect('/success');
    } catch (error) {
      util.response.status500(res, 'Something went wrong with authorization uri: ' + error);
    }

  }
}

module.exports = oauthController;