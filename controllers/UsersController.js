import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * UsersController class to handle user-related actions.
 */
class UserController {
  /**
   * Creates a new user.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<Object>} The response object with the new user's ID and email,
   * or an error message.
   */
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: `Missing ${!email ? 'email' : 'password'}` });
    }

    try {
      if (await dbClient.findOne('users', { email })) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const newUser = await dbClient.saveOne('users', {
        email,
        password: sha1(password),
      });
      return res.status(201).json({ id: newUser._id, email: newUser.email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Retrieves the user based on the token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<Object>} The response object with the user's ID and email,
   * or an error message.
   */
  static async getMe(req, res) {
    const token = req.header('X-Token');

    try {
      const user = await UserController.verifyUser(token);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Verifies a user based on the provided token.
   * @param {string} token - The token to verify.
   * @returns {Promise<Object|null>} The user object if the token is valid, otherwise null.
   */
  static async verifyUser(token) {
    if (!token) return null;

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return null;

      const user = await dbClient.findOne('users', {
        _id: new ObjectId(userId),
      });
      return user || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default UserController;
