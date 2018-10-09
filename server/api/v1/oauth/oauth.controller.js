const co = require('co');
const jwtDecode = require('jwt-decode');
const userMapping = require('../../../usermapping');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const util = common.util;
const oauth = common.oauth;
const oauthConfig = common.config.oauth;

const APP_TOKEN_COOKIE_NAME = oauthConfig.appTokenCookieName;
const USER_ROLE_COOKIE_NAME = 'user-role';

const oauthController = {

  redirect: async function (req, res) {
    try {
      const oauthSignInUrl = await oauth.oauthGetSigninURL();
      util.response.status200(res, {url: oauthSignInUrl});
    } catch (err) {
      util.response.status500(res, 'Something went wrong with oauth sign in url: ' + err);
    }
  },

  callback: function (req, res) {
    co(function* () {
      const accessTokenResponse = yield oauth.oauthGetAccessTokenByAuthCode(req.query['code']);
      const accessToken = accessTokenResponse.token['access_token'];
      const decoded = jwtDecode(accessTokenResponse.token['access_token']);
      const userEmail = decoded['email'];
      let address = null;

      try {
        const getKeyResponse = yield rest.getKey(accessToken);
        if (getKeyResponse && getKeyResponse.address) {
          address = getKeyResponse.address;
        }
      } catch (err) {
        if (err.status === 400) {
          try {
            const createKeyResponse = yield rest.createKey(accessToken);
            address = createKeyResponse.address;
            yield rest.fill({name: userEmail, address: address});
          } catch (err) {
            return util.response.status500(res, 'Error Creating User Key or Faucet account');
          }
        } else {
          return util.response.status500(res, 'Error Getting User Key');
        }
      }

      // TODO: Implement a way to properly handle user roles
      const userRole = userMapping.filter(user => {
        return user.emailId === userEmail;
      })[0].userRole;

      res.cookie(APP_TOKEN_COOKIE_NAME, accessTokenResponse.token['access_token'], {maxAge: 900000, httpOnly: false});
      res.cookie(USER_ROLE_COOKIE_NAME, userRole, {maxAge: 900000, httpOnly: false});
      res.redirect('/success');

    }).catch(err => {
      util.response.status500(res, 'Error on Oauth Callback');
    });
  },

  logout: async function (req, res) {
    try {
      //TODO: Get oauthSignOutUrl from blockapps-rest library
      const oauthSignOutUrl = 'https://login.microsoftonline.com/2ec6965f-17c7-47c0-80c8-98e1a0c7b66a/oauth2/logout?client_id=c1cc5161-178a-4e0c-a0cc-9a420a87859f&post_logout_redirect_uri=http://localhost/oauth';
      res.clearCookie(APP_TOKEN_COOKIE_NAME);
      res.clearCookie(USER_ROLE_COOKIE_NAME);
      util.response.status200(res, {url: oauthSignOutUrl});
    } catch (err) {
      util.response.status500(res, 'Something went wrong with oauth sign out url: ' + err);
    }
  }
}

module.exports = oauthController;