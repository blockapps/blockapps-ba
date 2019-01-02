require('co-mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require(process.cwd() + '/server');
const ba = require('blockapps-rest');
const common = ba.common;
const assert = common.assert;
const config = common.config;
const apiUrl = config.apiUrl;

function* post(endpoint, body, accessToken=null, unitTest, useAuthHeader) {
  const queryParams = (unitTest) ? '?unitTest=true' : '';
  const url = apiUrl + endpoint + queryParams;
  if (config.apiDebug) console.log('   poster.post', url, body);
  let response;

  if(accessToken) {
    response  = useAuthHeader
      ? yield chai.request(server).post(url).set('Authorization', `Bearer ${accessToken}`).send(body)
      : yield chai.request(server).post(url).set('Cookie', `${config.oauth.appTokenCookieName}=${accessToken}`).send(body)
  }
  else {
    response = yield chai.request(server).post(url).send(body);
  }
  
  assert.isBelow(response.statusCode, 300, `${url} should return status 20X`);
  if (config.apiDebug) console.log('  poster.post: response.body.data: ', response.body.data);
  return response.body.data;
}

function* get(endpoint, accessToken=null, useAuthHeader) {
  console.log(`${config.oauth.appTokenCookieName}=${accessToken}`)
  const url = apiUrl + endpoint;
  if (config.apiDebug) console.log('   poster.get', url);
  let response;

  if(accessToken) {
    response = useAuthHeader
      ? yield chai.request(server).get(url).set('Authorization', `Bearer ${accessToken}`)
      : yield chai.request(server).get(url).set('Cookie', `${config.oauth.appTokenCookieName}=${accessToken}`)
  } else {
    response = yield chai.request(server).get(url);
  }
  
  assert.equal(response.statusCode, 200, `${url} should return status 200 OK`);
  if (config.apiDebug) console.log('   poster.get: response.body.data: ', response.body.data);
  return response.body.data;
}

module.exports = {
  post,
  get,
}
