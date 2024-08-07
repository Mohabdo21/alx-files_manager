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

  // Flush all keys in Redis
  await redisClient.flushallAsync();
});

after(async () => {
  await mongoClient.close();
  await redisClient.quitAsync();
});

describe('authController Integration Tests', () => {
  it('should authenticate a user and return a token', async () => {
    const newUser = { email: 'mohannadabdo21@yahoo.com', password: 'password1234' };
    await chai.request(app).post('/users').send(newUser);

    const authHeader = Buffer.from(
      `${newUser.email}:${newUser.password}`,
    ).toString('base64');
    const res = await chai
      .request(app)
      .get('/connect')
      .set('Authorization', `Basic ${authHeader}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('token');

    const { token } = res.body;
    const userId = await redisClient.get(`auth_${token}`);
    expect(userId).to.not.be.null;
  });

  it('should return an error for invalid credentials', async () => {
    const authHeader = Buffer.from(
      'abdofola67@gmail.com:wrongpassword',
    ).toString('base64');
    const res = await chai
      .request(app)
      .get('/connect')
      .set('Authorization', `Basic ${authHeader}`);

    expect(res).to.have.status(401);
    expect(res.body).to.have.property('error', 'Unauthorized');
  });

  it('should log out a user and invalidate the token', async () => {
    const newUser = {
      email: 'abdofola67@gmail.com',
      password: 'password123',
    };
    await chai.request(app).post('/users').send(newUser);

    const authHeader = Buffer.from(
      `${newUser.email}:${newUser.password}`,
    ).toString('base64');
    const resConnect = await chai
      .request(app)
      .get('/connect')
      .set('Authorization', `Basic ${authHeader}`);

    const { token } = resConnect.body;

    const resDisconnect = await chai
      .request(app)
      .get('/disconnect')
      .set('X-Token', token);

    expect(resDisconnect).to.have.status(204);

    const userId = await redisClient.get(`auth_${token}`);
    expect(userId).to.be.null;
  });

  it('should return an error for logout with an invalid token', async () => {
    const res = await chai
      .request(app)
      .get('/disconnect')
      .set('X-Token', 'invalid-token');

    expect(res).to.have.status(401);
    expect(res.body).to.have.property('error', 'Unauthorized');
  });
});
/* eslint-enable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
