/* eslint-disable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
import { expect } from 'chai';
import redisClient from '../../utils/redis';

describe('redisClient Utility', function () {
  this.timeout(10000);

  after(async () => {
    await redisClient.del('test_key');
  });

  describe('#isAlive()', () => {
    it('should return true if Redis client is connected', () => {
      expect(redisClient.isAlive()).to.equal(true);
    });
  });

  describe('#set() and #get()', () => {
    it('should set and get a value', async () => {
      await redisClient.set('test_key', '345', 10);
      const value = await redisClient.get('test_key');
      expect(value).to.equal('345');
    });

    it('should handle getting an expired value', async () => {
      await redisClient.set('test_key_expired', '356', 1);
      // Wait for the key to expire
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const value = await redisClient.get('test_key_expired');
      expect(value).to.be.null;
    });

    it('should handle getting a deleted value', async () => {
      await redisClient.set('test_key', '345', 10);
      await redisClient.del('test_key');
      const value = await redisClient.get('test_key');
      expect(value).to.be.null;
    });

    it('should handle non-existent keys', async () => {
      const value = await redisClient.get('non_existent_key');
      expect(value).to.be.null;
    });
  });

  describe('#del()', () => {
    it('should delete a key', async () => {
      await redisClient.set('test_key', 'value', 10);
      await redisClient.del('test_key');
      const value = await redisClient.get('test_key');
      expect(value).to.be.null;
    });
  });
});
/* eslint-enable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
