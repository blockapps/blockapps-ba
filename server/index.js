'use strict'
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ba = require('blockapps-rest');
const common = ba.common;
const oauth = common.oauth;
const oauthConfig = common.config.oauth;
const cors = require('cors');
const cookieParser = require('cookie-parser');

// read the app deployment file
// const deploy = fsutil.yamlSafeLoadSync(config.deployFilename, config.apiDebug);
// console.log('Deploy:', deploy);
// if (deploy === undefined) throw new Error('Deploy config.deployFilename not found ', config.deployFilename);
// app.set('deploy', deploy);

/**
 * Config to handle POSTs to API
 *  - Parse JSON and URL encode
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

/**
 * Set static assets directory
 * for documentation
 */
// app.use(express.static(path.join(__dirname, '../doc')));

/**
 * Set up API routes
 */
const routes = require('./routes');
app.use('/', routes);


// get the intended port number, use port 3031 if not provided
const port = process.env.PORT || 3031;

const server = app.listen(port, (err) => {
  if (err) {
    console.log((err.message));
  } else {
    console.log('App listening on port ' + port);
  }
});

/**
 * initialize blockapps-rest oauth library
 */
const initialize = () => {
  try {
    // Initialize STRATO OAUTH
    app.oauth = oauth.init(oauthConfig);
    return server;
  } catch (e) {
    console.error('Error initializing blockapps-rest library', e);
    process.exit(1);
  }
}

module.exports = initialize();
