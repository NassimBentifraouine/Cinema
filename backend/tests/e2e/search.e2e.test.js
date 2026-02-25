const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const Movie = require('../../src/models/Movie.model');

const TEST_DB = 'mongodb://localhost:27017/cinema_search_test';

beforeAll(async () => {
    await mongoose.connect(TEST_DB);
    // Seed some movies
    await Movie.create([
        { imdbId: 'tt0000001', title: 'Batman Begins', year: '2005', genre: ['Action'], imdbRating: 8.2, isExplicitlyAdded: true },
        { imdbId: 'tt0000002', title: 'The Dark Knight', year: '2008', genre: ['Action', 'Crime'], imdbRating: 9.0, isExplicitlyAdded: true },
        { imdbId: 'tt0000003', title: 'Inception', year: '2010', genre: ['Sci-Fi'], imdbRating: 8.8, isExplicitlyAdded: true },
    ]);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Movies Search E2E', () => {
    it('GET /api/movies → 200 with paginated results', async () => {
        const res = await request(app).get('/api/movies');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('movies');
        expect(Array.isArray(res.body.movies)).toBe(true);
    });

    it('GET /api/movies?search=Batman → filters results', async () => {
        const res = await request(app).get('/api/movies?search=Batman');
        expect(res.status).toBe(200);
        expect(res.body.movies.some((m) => m.title.includes('Batman'))).toBe(true);
    });

    it('GET /api/movies?minRating=9 → filters by rating', async () => {
        const res = await request(app).get('/api/movies?minRating=9');
        expect(res.status).toBe(200);
        res.body.movies.forEach((m) => expect(m.imdbRating).toBeGreaterThanOrEqual(9));
    });

    it('GET /api/movies?sort=title → sorted by title', async () => {
        const res = await request(app).get('/api/movies?sort=title');
        expect(res.status).toBe(200);
        const titles = res.body.movies.map((m) => m.title);
        expect(titles).toEqual([...titles].sort());
    });

    it('GET /api/movies?page=1&limit=1 → pagination works', async () => {
        const res = await request(app).get('/api/movies?page=1&limit=1');
        expect(res.status).toBe(200);
        expect(res.body.movies.length).toBe(1);
        expect(res.body.pages).toBeGreaterThan(1);
    });
});
