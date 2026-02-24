const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');

const TEST_DB = 'mongodb://localhost:27017/cinecat_test';

beforeAll(async () => {
    await mongoose.connect(TEST_DB);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Auth E2E', () => {
    const user = { email: `e2e_${Date.now()}@test.com`, password: 'Test@1234!', confirmPassword: 'Test@1234!' };
    let token;

    it('POST /api/auth/register → 201 + token', async () => {
        const res = await request(app).post('/api/auth/register').send(user);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe(user.email);
        token = res.body.token;
    });

    it('POST /api/auth/register → 409 if email exists', async () => {
        const res = await request(app).post('/api/auth/register').send(user);
        expect(res.status).toBe(409);
    });

    it('POST /api/auth/login → 200 + token', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('POST /api/auth/login → 401 bad password', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'WrongPass@1' });
        expect(res.status).toBe(401);
    });

    it('GET /api/auth/me → 200 with valid token', async () => {
        const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe(user.email);
    });

    it('GET /api/auth/me → 401 without token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});
