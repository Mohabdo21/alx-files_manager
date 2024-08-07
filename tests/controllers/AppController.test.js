/* eslint-disable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
import chai from 'chai';
import chaiHttp from 'chai-http';
import redisClient from '../../utils/redis';
import dbClient from '../../utils/db';
import app from '../../server';

const { expect } = chai;

chai.use(chaiHttp);

// Helper function to wait for the database to be connected
const waitForDbConnection = async (timeout = 5000) => {
  const start = Date.now();
  while (!dbClient.isAlive()) {
    if (Date.now() - start > timeout) {
      throw new Error('Database client did not connect in time');
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

before(async () => {
  try {
    await waitForDbConnection();

    await dbClient.deleteOne('users', {});
    await dbClient.deleteOne('files', {});

    // Flush all keys in Redis
    await redisClient.flushallAsync();
  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  }
});

after(async () => {
  try {
    await redisClient.quitAsync();
  } catch (error) {
    console.error('Teardown error:', error);
    throw error;
  }
});

describe('appController Integration Tests', () => {
  it('should return the status of the application storage', async () => {
    const res = await chai.request(app).get('/status');
    expect(res).to.have.status(200);
    expect(res.body).to.have.keys('redis', 'db');
    expect(res.body.redis).to.be.true;
    expect(res.body.db).to.be.true;
  });

  it('should return the statistics of the application data', async () => {
    // Insert sample data into the database using saveOne
    await dbClient.saveOne('users', { name: 'Foola' });
    await dbClient.saveOne('files', { fileName: 'example.txt' });

    const res = await chai.request(app).get('/stats');
    expect(res).to.have.status(200);
    expect(res.body).to.have.keys('users', 'files');
    expect(res.body.users).to.equal(1);
    expect(res.body.files).to.equal(1);
  });
});
/* eslint-enable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
