const omdbService = require('../../src/services/omdb.service');
const Movie = require('../../src/models/Movie.model');
const axios = require('axios');

jest.mock('../../src/models/Movie.model');
jest.mock('axios');

describe('OMDb Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.OMDB_API_KEY = 'test_key';
    });

    describe('getMovieById', () => {
        it('should return cached movie if recent', async () => {
            const cachedMovie = { imdbId: 'tt1234567', title: 'Test Movie', cachedAt: new Date() };
            Movie.findOne.mockResolvedValue(cachedMovie);
            const result = await omdbService.getMovieById('tt1234567');
            expect(result).toEqual(cachedMovie);
            expect(axios.get).not.toHaveBeenCalled();
        });

        it('should fetch from OMDb if not cached', async () => {
            Movie.findOne.mockResolvedValue(null);
            axios.get.mockResolvedValue({
                data: {
                    Response: 'True',
                    imdbID: 'tt1234567',
                    Title: 'Test Movie',
                    Year: '2022',
                    Genre: 'Action, Drama',
                    Plot: 'A great film.',
                    Poster: 'http://example.com/poster.jpg',
                    Director: 'Test Director',
                    Actors: 'Actor A',
                    Runtime: '120 min',
                    Language: 'English',
                    imdbRating: '8.0',
                    imdbVotes: '100000',
                },
            });
            Movie.findOneAndUpdate.mockResolvedValue({ imdbId: 'tt1234567', title: 'Test Movie' });
            const result = await omdbService.getMovieById('tt1234567');
            expect(axios.get).toHaveBeenCalled();
            expect(result.title).toBe('Test Movie');
        });

        it('should throw if OMDb returns error', async () => {
            Movie.findOne.mockResolvedValue(null);
            axios.get.mockResolvedValue({ data: { Response: 'False', Error: 'Movie not found!' } });
            await expect(omdbService.getMovieById('tt0000000')).rejects.toThrow('Movie not found!');
        });
    });
});
