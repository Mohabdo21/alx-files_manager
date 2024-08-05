import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
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
}

export default FilesController;
