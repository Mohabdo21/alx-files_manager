import sha1 from 'sha1';
import dbClient from '../utils/db';

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
      const collection = dbClient.db.collection('users');
      if (await collection.findOne({ email })) return res.status(400).json({ error: 'Already exist' });

      const {
        ops: [newUser],
      } = await collection.insertOne({ email, password: sha1(password) });
      return res.status(201).json({ id: newUser._id, email: newUser.email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = UserController;
