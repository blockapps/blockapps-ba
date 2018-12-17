const routes = require('express').Router();

const { validateCookie } = require('./middleware/validateCookie');

const heartbeat = require('./api/v1/heartbeat');
const projects = require('./api/v1/projects');
const users = require('./api/v1/users');
const chains = require('./api/v1/chains');
const authentication = require('./api/v1/authentication');
const me = require('./api/v1/me');

routes.use('/api/v1/heartbeat', validateCookie(), heartbeat);
routes.use('/api/v1/projects', validateCookie(), projects);
routes.use('/api/v1/users', validateCookie(), users);
routes.use('/api/v1/chains', validateCookie(), chains);
routes.use('/api/v1/authentication', authentication);
routes.use('/api/v1/me', validateCookie(), me);

module.exports = routes;
