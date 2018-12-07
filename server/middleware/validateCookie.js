const ba = require('blockapps-rest');
const { common } = ba;
const { util } = common;

function validateCookie(req, res, next) {
  return async function (req, res, next) {
    const accessToken = req.cookies[req.app.oauth.getCookieNameAccessToken()];

    if (!accessToken) {
      util.response.status('401', res, { loginUrl: req.app.oauth.oauthGetSigninURL() });
    } else {
      try {
        // FIX ME: ba-rest does not verify jwt signature. Depends on STRATO nginx to verify.
        // This maybe ok. Need to verify
        await req.app.oauth.validateAndGetNewToken(req, res);
      } catch (err) {
        return util.response.status('401', res, { loginUrl: req.app.oauth.getLogOutUrl() });
      }
      return next();
    }
  }
}

module.exports = {
  validateCookie
}