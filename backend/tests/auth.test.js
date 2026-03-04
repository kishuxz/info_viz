const request = require('supertest');
const app = require('../server'); // adjust path if needed

describe('Auth Routes', () => {

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `testuser_${Date.now()}@example.com`,
          password: 'TestPassword123!'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject registration with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'TestPassword123!' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject registration with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      expect(res.statusCode).toBe(401);
    });

    it('should reject login with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });
      expect(res.statusCode).toBe(400);
    });
  });

});
