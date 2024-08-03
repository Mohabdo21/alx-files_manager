import { Router } from 'express';
import AppController from '../controllers/AppController';

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

module.exports = routes;
