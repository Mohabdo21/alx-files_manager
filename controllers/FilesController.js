import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import mime from 'mime-types';
import path from 'path';
import { ObjectId } from 'mongodb';
import UserController from './UsersController';
import dbClient from '../utils/db';

/**
 * Validates if the parentId is valid and of type folder.
 * @param {string} parentId - The parentId to validate.
 * @throws Will throw an error if the parentId is invalid or not a folder.
 */
async function validateParentId(parentId) {
  const parentFile = await dbClient.findOne('files', {
    _id: new ObjectId(parentId),
  });
  if (!parentFile) throw new Error('Parent not found');
  if (parentFile.type !== 'folder') throw new Error('Parent is not a folder');
}

/**
 * Saves the file data to disk and returns the local path.
 * @param {string} data - The base64-encoded file data.
 * @returns {Promise<string>} The local path where the file is saved.
 */
async function saveFile(data) {
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const fileId = uuidv4();
  const localPath = path.join(folderPath, fileId);
  fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

  return localPath;
}

/**
 * FilesController class to handle file-related actions.
 */
class FilesController {
  /**
   * Handles file and folder uploads, validating inputs and storing data.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<Object>} The response object with file metadata or an error message.
   */
  static async postUpload(req, res) {
    const {
      name, type, parentId, isPublic = false, data,
    } = req.body;
    const token = req.header('X-Token');

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      const user = await UserController.verifyUser(token);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      if (parentId) await validateParentId(parentId);

      const localPath = type !== 'folder' ? await saveFile(data) : null;

      const file = {
        userId: user._id,
        name,
        type,
        parentId: parentId || 0,
        isPublic,
        ...(type !== 'folder' && { localPath }),
      };

      const newFile = await dbClient.saveOne('files', file);

      return res.status(201).json({
        id: newFile._id,
        userId: newFile.userId,
        name: newFile.name,
        type: newFile.type,
        isPublic: newFile.isPublic,
        parentId: newFile.parentId,
        ...(type !== 'folder' && { localPath: newFile.localPath }),
      });
    } catch (error) {
      console.error(error.message);
      let statusCode = 500;
      let errorMessage = 'Server error';

      if (error.message === 'Parent not found') {
        statusCode = 400;
        errorMessage = 'Parent not found';
      } else if (error.message === 'Parent is not a folder') {
        statusCode = 400;
        errorMessage = 'Parent is not a folder';
      }

      return res.status(statusCode).json({ error: errorMessage });
    }
  }

  /**
   * Retrieves a single file document based on the ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>}
   */
  static async getShow(req, res) {
    const { id } = req.params;
    const token = req.header('X-Token');

    try {
      const user = await UserController.verifyUser(token);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const file = await dbClient.findOne('files', {
        _id: new ObjectId(id),
        userId: user._id,
      });

      if (!file) return res.status(404).json({ error: 'Not found' });
      const { localPath, _id, ...resp } = file;
      resp.id = _id;

      return res.status(200).json(resp);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Retrieves all file documents for a specific parentId with pagination.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>}
   */
  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const { parentId = 0, page = 0 } = req.query;

    try {
      const user = await UserController.verifyUser(token);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const mathCondition = {
        userId: user._id,
      };

      if (parentId) {
        mathCondition.parentId = parentId;
      }

      const pipeline = [
        { $match: mathCondition },
        { $skip: parseInt(page, 10) * 20 },
        { $limit: 20 },
        {
          $project: {
            _id: 0,
            id: '$_id',
            userId: 1,
            name: 1,
            type: 1,
            isPublic: 1,
            parentId: 1,
            localPath: 1,
          },
        },
      ];

      const files = await dbClient.aggregate('files', pipeline);
      return res.status(200).json(files);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Set isPublic to true on the file document based on the ID
   * @param {Object} req - The request object.
   * @param {Object} res - The request object.
   *
   * @returns {Promise<any>}
   */
  static async putPublish(req, res) {
    const { id } = req.params;
    const token = req.header('X-Token');
    const user = await UserController.verifyUser(token);
    const query = { _id: new ObjectId(id) };
    const update = { $set: { isPublic: true } };

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    query.userId = user._id;

    const file = await dbClient.findOne('files', query);

    if (!file) return res.status(404).json({ error: 'Not found' });

    // returns some info about the operation, such as number of docuemnts,
    // matched and modified.
    await dbClient.updateOne('files', query, update);
    // since the operation is success, no need to make another,
    // DB query.
    const {
      _id, localPath, isPublic, ...resp
    } = file;
    resp.id = _id;
    resp.isPublic = true;

    return res.status(200).json(resp);
  }

  /**
   * Set isPublic to false on the file document based on the ID
   * @param {Object} req - The request object.
   * @param {Object} res - The request object.
   *
   * @returns {Promise<any>}
   */
  static async putUnpublish(req, res) {
    const token = req.header('X-Token');
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const update = { $set: { isPublic: false } };
    const user = await UserController.verifyUser(token);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    query.userId = user._id;
    const file = await dbClient.findOne('files', query);

    if (!file) return res.status(404).json({ error: 'Not found' });

    await dbClient.updateOne('files', query, update);
    const { _id, localPath, ...resp } = file;
    resp.id = _id;
    resp.isPublic = false;

    return res.status(200).json(resp);
  }

  /**
   * Return content of the file document based on the ID
   * @param {Object} req - The request object.
   * @param {Object} res - The request object.
   *
   * @returns {Promise<any>} content of a file promisified
   */
  static async getFile(req, res) {
    const { id } = req.params;
    const token = req.header('X-Token');

    try {
      const file = await dbClient.findOne('files', { _id: new ObjectId(id) });
      if (!file) return res.status(404).json({ error: 'Not found' });

      if (!file.isPublic) {
        const user = await UserController.verifyUser(token);
        if (!user || user._id.toString() !== file.userId.toString()) {
          return res.status(404).json({ error: 'Not found' });
        }
      }

      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      if (!fs.existsSync(file.localPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      const mimeType = mime.lookup(file.name);
      res.setHeader('Content-Type', mimeType);

      const fileContent = fs.readFileSync(file.localPath);
      return res.status(200).send(fileContent);
    } catch (err) {
      console.error({ err });
      return res.status(500).json({ error: 'Unexpected error' });
    }
  }
}

export default FilesController;
