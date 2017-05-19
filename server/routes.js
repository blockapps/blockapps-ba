const routes = require('express').Router();
const heartbeat = require('./api/v1/heartbeat');
const login = require('./api/v1/login');
const projects = require('./api/v1/projects');
const users = require('./api/v1/users');
const system = require('./api/v1/system');

routes.use('/api/v1/heartbeat', heartbeat);
routes.use('/api/v1/system', system);
routes.use('/api/v1/login', login);
routes.use('/api/v1/projects', projects);
routes.use('/api/v1/users', users);
/**
 * Serve the docs for the api
 */
// const path = require('path');
// routes.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname + '/../doc/index.html'));
// });

module.exports = routes;
