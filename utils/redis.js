const redis = require('redis');
const { promisify } = require('util');

/**
 * RedisClient class to interact with Redis.
 */
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    this.client.on('error', (error) => {
      console.error(`Cannot connect to the Redis client: ${error.message}`);
    });
  }

  /**
   * Checks if the Redis client is connected.
   * @returns {boolean} True if connected, otherwise false.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Gets the value of a key from Redis.
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string>} The value of the key.
   */
  async get(key) {
    return RedisClient.handleAsyncOperation(
      () => this.getAsync(key),
      `getting key ${key}`,
    );
  }

  /**
   * Sets a key-value pair in Redis with an expiration time.
   * @param {string} key - The key to set.
   * @param {string} value - The value to set.
   * @param {number} duration - The expiration time in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    return RedisClient.handleAsyncOperation(
      () => this.setAsync(key, duration, value),
      `setting key ${key}`,
    );
  }

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<void>}
   */
  async del(key) {
    return RedisClient.handleAsyncOperation(
      () => this.delAsync(key),
      `deleting key ${key}`,
    );
  }

  /**
   * Handles asynchronous operations with error handling.
   * @param {Function} operation - The asynchronous operation to perform.
   * @param {string} description - A description of the operation for error messages.
   * @returns {Promise<any>} The result of the asynchronous operation.
   */
  static async handleAsyncOperation(operation, description) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Error ${description}: ${error.message}`);
      return null;
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
