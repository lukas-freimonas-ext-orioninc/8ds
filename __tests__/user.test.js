const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, connectDB } = require('../server');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('Should register a new user', async () => {
    const res = await request(app).post('/api/users/register').send({
      username: 'testuser',
      password: 'testpassword',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');
  });

  test('Should login a user', async () => {
    await request(app).post('/api/users/register').send({
      username: 'testuser',
      password: 'testpassword',
    });

    const res = await request(app).post('/api/users/login').send({
      username: 'testuser',
      password: 'testpassword',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
