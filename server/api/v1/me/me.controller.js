const co = require('co');
const ba = require('blockapps-rest');
const common = ba.common;
const rest = ba.rest6;
const util = common.util;
const utils = require('../../../utils');

const usersController = {
  get: function (req, res) {
    const accessToken = utils.getAccessTokenFromCookie(req);

    co(function* () {
      const address = yield rest.getKey(accessToken);
      util.response.status200(res, address);
    }).catch(err => {
      util.response.status(err.statusCode, res, err.message);
    });
  },
};

module.exports = usersController;
