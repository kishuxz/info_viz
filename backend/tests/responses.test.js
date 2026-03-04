const request = require('supertest');
const app = require('../server'); // adjust path if needed

describe('Responses Routes', () => {

  describe('POST /api/responses/:formId', () => {
    it('should return 404 for non-existent form', async () => {
      const res = await request(app)
        .post('/api/responses/000000000000000000000000')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          organization: 'Test Org'
        });
      expect([404, 400]).toContain(res.statusCode);
    });
  });

  describe('GET /api/responses/:formId (protected)', () => {
    it('should reject without auth token', async () => {
      const res = await request(app)
        .get('/api/responses/000000000000000000000000');
      expect(res.statusCode).toBe(401);
    });
  });

});
