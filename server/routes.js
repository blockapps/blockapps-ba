const routes = require('express').Router();
const heartbeat = require('./api/v1/heartbeat');
const login = require('./api/v1/login');

routes.use('/api/v1/heartbeat', heartbeat);
routes.use('/api/v1/login', login);
/**
 * Serve the docs for the api
 */
// const path = require('path');
// routes.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname + '/../doc/index.html'));
// });

module.exports = routes;
