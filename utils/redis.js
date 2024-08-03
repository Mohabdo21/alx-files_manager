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
    try {
      return await this.getAsync(key);
    } catch (error) {
      console.error(`Error getting key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Sets a key-value pair in Redis with an expiration time.
   * @param {string} key - The key to set.
   * @param {string} value - The value to set.
   * @param {number} duration - The expiration time in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    try {
      await this.setAsync(key, duration, value);
    } catch (error) {
      console.error(`Error setting key ${key}: ${error.message}`);
    }
  }

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<void>}
   */
  async del(key) {
    try {
      await this.delAsync(key);
    } catch (error) {
      console.error(`Error deleting key ${key}: ${error.message}`);
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
