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
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await dbClient.findOne(
        'users',
        { _id: new ObjectId(userId) },
        { email: 1 },
      );
      return user
        ? res.status(200).json({ id: userId, email: user.email })
        : res.status(401).json({ error: 'Unauthorized' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
}

export default UserController;
