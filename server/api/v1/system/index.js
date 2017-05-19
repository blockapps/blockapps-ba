const express = require('express');
const router = express.Router();
const ba = require('blockapps-rest');
const config = ba.common.config;
const util = ba.common.util;

router.get('/explorer-url', function(req, res){
  const explorerUrl = config.getExplorerUrl();
  if (explorerUrl) {
    console.log(explorerUrl);
    util.response.status200(res, {
      explorerUrl: config.getExplorerUrl()
    })
  } else {
    util.response.status500(res, 'Explorer url is not set on server');
  }
});

module.exports = router;
