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

describe('usersController Integration Tests', () => {
  it('should create a new user with valid data', async () => {
    const newUser = {
      email: 'mohannadabdo21@gmail.com',
      password: 'password12345',
    };

    const res = await chai.request(app).post('/users').send(newUser);

    expect(res).to.have.status(201);
    expect(res.body).to.have.keys('id', 'email');
    expect(res.body.email).to.equal(newUser.email);

    const user = await dbClient.findOne('users', { email: newUser.email });
    expect(user).to.not.be.null;
    expect(user.email).to.equal(newUser.email);
  });

  it('should return an error for missing email or password', async () => {
    const resNoEmail = await chai
      .request(app)
      .post('/users')
      .send({ password: 'password123' });

    expect(resNoEmail).to.have.status(400);
    expect(resNoEmail.body).to.have.property('error', 'Missing email');

    const resNoPassword = await chai
      .request(app)
      .post('/users')
      .send({ email: 'abdofola67@gmail.com' });

    expect(resNoPassword).to.have.status(400);
    expect(resNoPassword.body).to.have.property('error', 'Missing password');
  });

  it('should return an error for an existing user', async () => {
    const existingUser = {
      email: 'mohannadabdo21@gmail.com',
      password: 'password12345',
    };
    await chai.request(app).post('/users').send(existingUser);

    const res = await chai.request(app).post('/users').send(existingUser);

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('error', 'Already exist');
  });

  it('should retrieve user details for authenticated users', async () => {
    const newUser = {
      email: 'mohannadabdo21@outlook.com',
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

    const resGetMe = await chai
      .request(app)
      .get('/users/me')
      .set('X-Token', token);

    expect(resGetMe).to.have.status(200);
    expect(resGetMe.body).to.have.keys('id', 'email');
    expect(resGetMe.body.email).to.equal(newUser.email);
  });

  it('should return an error for unauthorized access', async () => {
    const res = await chai
      .request(app)
      .get('/users/me')
      .set('X-Token', 'invalid-token');

    expect(res).to.have.status(401);
    expect(res.body).to.have.property('error', 'Unauthorized');
  });
});
/* eslint-enable no-undef, jest/prefer-expect-assertions, jest/valid-expect, no-unused-expressions */
