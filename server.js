import express from 'express';
import routes from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

// Parse the JSON request bodies
app.use(express.json());

// Pretty-printed JSON response
app.set('json spaces', 2);

app.use('/', routes);

/**
 * Starts the Express server.
 * @param {number} port - The port number on which the server will run.
 */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
