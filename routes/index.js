import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const routes = Router();

/**
 * Route to get the status of the application.
 * @name get/status
 */
routes.get('/status', AppController.getStatus);

/**
 * Route to get the statistics of the application.
 * @name get/stats
 */
routes.get('/stats', AppController.getStats);

/**
 * Route to create a new user in the DB.
 * @name post/users
 */
routes.post('/users', UsersController.postNew);

module.exports = routes;
