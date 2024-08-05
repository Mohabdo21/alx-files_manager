import { MongoClient } from 'mongodb';

/**
 * DBClient class to interact with MongoDB.
 */
class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
      if (!error) {
        this.db = client.db(database);
        this.initCollections(['users', 'files']);
      } else {
        this.db = false;
        console.error(`Cannot connect to MongoDB: ${error.message}`);
      }
    });
  }

  /**
   * Checks if the MongoDB client is connected.
   * @returns {boolean} True if connected, otherwise false.
   */
  isAlive() {
    return !!this.db;
  }

  /**
   * Gets the number of documents in the users collection.
   * @returns {Promise<number>} The number of documents in the users collection.
   */
  async nbUsers() {
    if (this.db) {
      return this.db.collection('users').countDocuments();
    }
    return 0;
  }

  /**
   * Gets the number of documents in the files collection.
   * @returns {Promise<number>} The number of documents in the files collection.
   */
  async nbFiles() {
    if (this.db) {
      return this.db.collection('files').countDocuments();
    }
    return 0;
  }

  /**
   * Initializes collections if they do not already exist.
   * @param {string[]} collections - The names of the collections to initialize.
   * @returns {Promise<void>}
   */
  async initCollections(collections) {
    /* await Promise.all(
      collections.map((coll) => {
        try {
          return this.db.createCollection(coll);
        } catch (err) {
          return Promise.resolve();
        }
      }),
    )
      .then((res) => console.log({ res }))
      .catch((err) => console.error({ err })); */
    try {
      const existingCollections = await this.db.listCollections().toArray();
      const existingNames = new Set(existingCollections.map((c) => c.name));
      const collectionsToCreate = collections.filter(
        (name) => !existingNames.has(name),
      );

      if (collectionsToCreate.length > 0) {
        await Promise.all(
          collectionsToCreate.map((name) => this.db.createCollection(name)),
        );
      }
    } catch (error) {
      console.error(`Error initializing collections: ${error.message}`);
    }
  }

  /**
   * Finds a single document in the specified collection.
   * @param {string} collectionName - The name of the collection.
   * @param {Object} query - The query object to match the document.
   * @param {Object} [projection] - The fields to include or exclude.
   * @returns {Promise<Object|null>} The found document or null if not found.
   */
  async findOne(collectionName, query, projection = {}) {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection(collectionName).findOne(query, { projection });
  }

  /**
   * Saves a single document in the specified collection.
   * @param {string} collectionName - The name of the collection.
   * @param {Object} document - The document to save.
   * @returns {Promise<Object>} The saved document with the inserted ID.
   */
  async saveOne(collectionName, document) {
    if (!this.db) throw new Error('Database not connected');
    const {
      ops: [newDocument],
    } = await this.db.collection(collectionName).insertOne(document);
    return newDocument;
  }

  /**
   * Deletes a single document from the specified collection.
   * @param {string} collectionName - The name of the collection.
   * @param {Object} query - The query object to match the document.
   * @returns {Promise<Object>} The result of the delete operation.
   */
  async deleteOne(collectionName, query) {
    if (!this.db) throw new Error('Database not connected');
    const result = await this.db.collection(collectionName).deleteOne(query);
    return result;
  }

  /**
   * Updates a single document in the specified collection.
   * @param {string} collectionName - The name of the collection.
   * @param {Object} query - The query object to match the document.
   * @param {Object} update - The update object to apply.
   * @param {Object} [options] - Additional options for the update operation.
   * @returns {Promise<Object>} The result of the update operation.
   */
  async updateOne(collectionName, query, update, options = {}) {
    if (!this.db) throw new Error('Database not connected');
    const result = await this.db
      .collection(collectionName)
      .updateOne(query, update, options);
    return result;
  }
}

const dbClient = new DBClient();
export default dbClient;
