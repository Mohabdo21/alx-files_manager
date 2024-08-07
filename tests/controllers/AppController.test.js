/* eslint-disable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
import chai from 'chai';
import chaiHttp from 'chai-http';
import { MongoClient } from 'mongodb';
import redisClient from '../../utils/redis';
import app from '../../server';

const { expect } = chai;

chai.use(chaiHttp);

let mongoClient;

before(async () => {
  mongoClient = await MongoClient.connect(
    'mongodb://localhost:27017/files_manager_test',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  );
  const db = mongoClient.db('files_manager_test');

  await db.collection('users').deleteMany({});
  await db.collection('files').deleteMany({});

  await redisClient.flushallAsync();
});

after(async () => {
  await mongoClient.close();
  await redisClient.quitAsync();
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
    const db = mongoClient.db('files_manager_test');
    await db.collection('users').insertOne({ name: 'Foola' });
    await db.collection('files').insertOne({ fileName: 'example.txt' });

    const res = await chai.request(app).get('/stats');
    expect(res).to.have.status(200);
    expect(res.body).to.have.keys('users', 'files');
    expect(res.body.users).to.equal(1);
    expect(res.body.files).to.equal(1);
  });
});
/* eslint-enable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
