import { MongoClient } from 'mongodb';

const url = `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 27017}`;
const database = process.env.DB_DATABASE || 'file_manager';

/**
 * DBClient class to interact with MongoDB.
 */
class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true })
      .then((client) => {
        this.db = client.db(database);
        this.initCollections(['users', 'files']);
      })
      .catch((error) => console.error(`Cannot connect to MongoDB: ${error.message}`));
  }

  /**
   * Checks if the MongoDB client is connected.
   * @returns {boolean} True if connected, otherwise false.
   */
  isAlive() {
    return !!this.db;
  }

  /**
   * Gets the number of documents in a specified collection.
   * @param {string} collectionName - The name of the collection.
   * @returns {Promise<number>} The number of documents in the collection.
   */
  async nbDocuments(collectionName) {
    if (!this.db) {
      console.error('Database connection is not established.');
      return 0;
    }

    return this.db
      .collection(collectionName)
      .countDocuments()
      .catch((error) => {
        console.error(
          `Error counting documents in ${collectionName}: ${error.message}`,
        );
        return 0;
      });
  }

  /**
   * Gets the number of documents in the users collection.
   * @returns {Promise<number>} The number of documents in the users collection.
   */
  nbUsers() {
    return this.nbDocuments('users');
  }

  /**
   * Gets the number of documents in the files collection.
   * @returns {Promise<number>} The number of documents in the files collection.
   */
  nbFiles() {
    return this.nbDocuments('files');
  }

  /**
   * Initializes collections if they do not already exist.
   * @param {string[]} collections - The names of the collections to initialize.
   * @returns {Promise<void>}
   */
  async initCollections(collections) {
    const existingCollections = await this.db.listCollections().toArray();
    const existingNames = new Set(existingCollections.map((c) => c.name));

    await Promise.all(
      collections.map((name) => (existingNames.has(name)
        ? Promise.resolve()
        : this.db.createCollection(name))),
    );
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
