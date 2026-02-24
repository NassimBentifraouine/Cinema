const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const Movie = require('../../src/models/Movie.model');

const TEST_DB = 'mongodb://localhost:27017/cinecat_fav_test';

let token;
let movieId;

beforeAll(async () => {
    await mongoose.connect(TEST_DB);
    // Create a test user
    const res = await request(app).post('/api/auth/register').send({
        email: `fav_${Date.now()}@test.com`,
        password: 'Test@1234!',
        confirmPassword: 'Test@1234!',
    });
    token = res.body.token;

    // Seed a movie
    const movie = await Movie.create({
        imdbId: 'tt9999001',
        title: 'Test Favorite Film',
        year: '2023',
    });
    movieId = movie._id.toString();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Favorites E2E', () => {
    it('POST /api/users/favorites/:movieId → 200 adds favorite', async () => {
        const res = await request(app)
            .post(`/api/users/favorites/${movieId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('favorites');
        expect(res.body.favorites.some((f) => f._id.toString() === movieId || f.toString() === movieId)).toBe(true);
    });

    it('GET /api/users/favorites → 200 returns list', async () => {
        const res = await request(app)
            .get('/api/users/favorites')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.favorites)).toBe(true);
        expect(res.body.favorites.length).toBeGreaterThan(0);
    });

    it('DELETE /api/users/favorites/:movieId → 200 removes favorite', async () => {
        const res = await request(app)
            .delete(`/api/users/favorites/${movieId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.favorites.some((f) => (f._id || f).toString() === movieId)).toBe(false);
    });

    it('GET /api/users/favorites → 401 without token', async () => {
        const res = await request(app).get('/api/users/favorites');
        expect(res.status).toBe(401);
    });
});
