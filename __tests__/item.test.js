const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, connectDB } = require('../server');
const User = require('../models/User');
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;
  await connectDB();

  const user = await User.create({
    username: 'testuser',
    password: 'testpassword',
  });
  userId = user._id;
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Item Routes', () => {
  beforeEach(async () => {
    await Item.deleteMany({});
  });

  test('Should create a new item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', token)
      .send({
        name: 'Test Item',
        quantity: 5,
        description: 'This is a test item',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Test Item');
  });

  test('Should get all items for a user', async () => {
    await Item.create({ name: 'Item 1', quantity: 1, user: userId });
    await Item.create({ name: 'Item 2', quantity: 2, user: userId });

    const res = await request(app)
      .get('/api/items')
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('Should update an item', async () => {
    const item = await Item.create({
      name: 'Old Item',
      quantity: 1,
      user: userId,
    });

    const res = await request(app)
      .put(`/api/items/${item._id}`)
      .set('Authorization', token)
      .send({
        name: 'Updated Item',
        quantity: 2,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Item');
    expect(res.body).toHaveProperty('quantity', 2);
  });

  test('Should delete an item', async () => {
    const item = await Item.create({
      name: 'Item to Delete',
      quantity: 1,
      user: userId,
    });

    const res = await request(app)
      .delete(`/api/items/${item._id}`)
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Item deleted successfully');

    const deletedItem = await Item.findById(item._id);
    expect(deletedItem).toBeNull();
  });
});
