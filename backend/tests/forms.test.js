const request = require('supertest');
const app = require('../server'); // adjust path if needed

describe('Forms Routes', () => {

  describe('GET /api/forms/:id', () => {
    it('should return 404 for non-existent form', async () => {
      const res = await request(app)
        .get('/api/forms/000000000000000000000000');
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for invalid form ID format', async () => {
      const res = await request(app)
        .get('/api/forms/invalid-id');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/forms (protected)', () => {
    it('should reject form creation without auth token', async () => {
      const res = await request(app)
        .post('/api/forms')
        .send({ event_name: 'Test Event', event_date: '2026-06-01' });
      expect(res.statusCode).toBe(401);
    });
  });

});
