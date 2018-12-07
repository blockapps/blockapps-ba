const co = require('co');
const ba = require('blockapps-rest');
const { common } = ba;
const { config, util } = common;
const jwtDecode = require('jwt-decode');
const utils = require('../../../utils');

const authenticationController = {
  
  redirect: function (req, res) {
    const oauthSignInUrl = req.app.oauth.oauthGetSigninURL();
    util.response.status200(res, {url: oauthSignInUrl});
  },

  callback: function (req, res) {
    co(function* () {
      const code = req.query['code'];
      const tokensResponse = yield req.app.oauth.oauthGetAccessTokenByAuthCode(code);
      const accessToken = tokensResponse.token['access_token'];
      const refreshToken = tokensResponse.token['refresh_token'];

      // Not using utils.getEmailIdFromToken() here as it we also need `exp` from token.
      const decodedToken = jwtDecode(accessToken);
      const userEmail = decodedToken['email'];
      const accessTokenExpiration = decodedToken['exp'];

      const userCreated = yield utils.createUser(accessToken, userEmail);
      if(userCreated.status != 200) {
        return util.response.status(userCreated.status, res, userCreated.message);
      }

      res.cookie(req.app.oauth.getCookieNameAccessToken(), accessToken, {maxAge: config['oauth']['appTokenCookieMaxAge'], httpOnly: true});
      res.cookie(req.app.oauth.getCookieNameAccessTokenExpiry(), accessTokenExpiration, {maxAge: config['oauth']['appTokenCookieMaxAge'], httpOnly: true});
      res.cookie(req.app.oauth.getCookieNameRefreshToken(), refreshToken, {maxAge: config['oauth']['appTokenCookieMaxAge'], httpOnly: true});
      res.redirect('/');

    }).catch(err => {
      util.response.status(401, res, err.message);
    });
  },

  logout: function (req, res) {
    const oauthSignOutUrl = req.app.oauth.getLogOutUrl();
    res.clearCookie(req.app.oauth.getCookieNameAccessToken());
    util.response.status200(res, {logoutUrl: oauthSignOutUrl})
  }

};

module.exports = authenticationController;
