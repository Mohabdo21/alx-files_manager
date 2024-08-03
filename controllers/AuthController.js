import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * AuthController class to handle authentication-related actions.
 */
class AuthController {
  /**
   * Connects a user and generates an authentication token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<Object>} The response object with the authentication token,
   * or an error message.
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) return res.status(401).json({ error: 'Unauthorized' });

    const [email, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString('ascii')
      .split(':');

    try {
      const user = await dbClient.findOne('users', {
        email,
        password: sha1(password),
      });
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Disconnects a user by invalidating the authentication token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>} The response object with no content, or an error message.
   */
  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token || !(await redisClient.get(`auth_${token}`))) return res.status(401).json({ error: 'Unauthorized' });

    try {
      await redisClient.del(`auth_${token}`);
      return res.status(204).json({});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
}

export default AuthController;
