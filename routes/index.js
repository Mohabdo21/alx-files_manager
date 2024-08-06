import { Router } from 'express';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const routes = Router();

// Application status routes
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

// User routes
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

// Authentication routes
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

/**
 * Route to upload files.
 * @name post/files
 */
routes.post('/files', FilesController.postUpload);

/**
 * Route to retrieve the file document based on the ID.
 * @name get/files/:id
 */
routes.get('/files/:id', FilesController.getShow);

/**
 * Route to retrieve all users file documents for a specific parentId and with pagination.
 * @name post/files
 */
routes.get('/files', FilesController.getIndex);

/**
 * Route to publish a file based on its ID
 * @name /files/:id/publish
 */
routes.put('/files/:id/publish', FilesController.putPublish);

/**
 * Route to un-publish a file based on its ID
 * @name /files/:id/publish
 */
routes.put('/files/:id/unpublish', FilesController.putUnpublish);

export default routes;
