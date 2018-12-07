const ba = require('blockapps-rest');
const rest = ba.rest6;
const jwtDecode = require('jwt-decode');

const createUser = function* (accessToken, emailId) {
  let address = null;
  try {
    const getKeyResponse = yield rest.getKey(accessToken);
    if (getKeyResponse && getKeyResponse.address) {
      address = getKeyResponse.address;
    } else {
      return { status: 404, message: 'user address not found' };
    }
  } catch (err) {
    if (err.status == 400) {
      try {
        const createKeyResponse = yield rest.createKey(accessToken);
        address = createKeyResponse.address;
        yield rest.fill({ name: emailId, address: address });
      } catch (err) {
        return { status: err.status, message: 'error creating user key or faucet account' };
      }
    } else {
      return { status: err.status, message: 'error getting user key', error: err };
    }
  }
  do {
    yield new Promise(resolve => setTimeout(resolve, 1000))
  } while ((yield rest.getBalance(address)) < 1);
  return { status: 200, message: 'success', address: address };
}

const getEmailIdFromToken = function(accessToken) {
  return (jwtDecode(accessToken)['email']);
}

const getAccessTokenFromCookie = (req) => {
  return req.cookies[req.app.oauth.getCookieNameAccessToken()];
}

module.exports = {
  createUser,
  getEmailIdFromToken,
  getAccessTokenFromCookie
}
