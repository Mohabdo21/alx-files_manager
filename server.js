import express from 'express';
import routes from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

app.use('/', routes);

/**
 * Starts the Express server.
 * @param {number} port - The port number on which the server will run.
 */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
