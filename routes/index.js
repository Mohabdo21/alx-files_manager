import { Router } from 'express';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

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
routes.post('/users', UserController.postNew);

/**
 * Route to fetch a user from the DB.
 * @name get/users/me
 */
routes.get('/users/me', UserController.getMe);

/**
 * Route to login user.
 * @name get/connect
 */
routes.get('/connect', AuthController.getConnect);

/**
 * Route to logout user.
 * @name get/disconnect
 */
routes.get('/disconnect', AuthController.getDisconnect);

export default routes;
