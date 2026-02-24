const axios = require('axios');
const Movie = require('../models/Movie.model');

const OMDB_BASE_URL = 'http://www.omdbapi.com/';
// Cache duration: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Fetch movie details by OMDb ID, using DB cache.
 * @param {string} imdbId
 * @returns {Promise<Object>} Movie document
 */
const getMovieById = async (imdbId) => {
    // Check cache
    const cached = await Movie.findOne({ imdbId });
    if (cached) {
        const age = Date.now() - new Date(cached.cachedAt).getTime();
        if (age < CACHE_TTL_MS) {
            return cached;
        }
    }

    // Fetch from OMDb
    const response = await axios.get(OMDB_BASE_URL, {
        params: {
            i: imdbId,
            apikey: process.env.OMDB_API_KEY,
            plot: 'full',
        },
    });

    const data = response.data;
    if (data.Response === 'False') {
        throw new Error(data.Error || 'Film non trouvé sur OMDb');
    }

    const genres = data.Genre ? data.Genre.split(', ') : [];
    const rating = parseFloat(data.imdbRating) || 0;

    const movieData = {
        imdbId: data.imdbID,
        title: data.Title,
        year: data.Year,
        genre: genres,
        categories: genres,
        plot: data.Plot,
        poster: data.Poster !== 'N/A' ? data.Poster : '',
        director: data.Director,
        actors: data.Actors,
        runtime: data.Runtime,
        language: data.Language,
        imdbRating: rating,
        imdbVotes: data.imdbVotes,
        cachedAt: new Date(),
    };

    // Upsert in DB cache
    const movie = await Movie.findOneAndUpdate(
        { imdbId },
        movieData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return movie;
};

/**
 * Search movies by title via OMDb, cache results.
 * @param {string} query - search string
 * @param {number} page - page number (1-based)
 * @returns {Promise<{movies: Array, total: number}>}
 */
const searchMovies = async (query, page = 1) => {
    const response = await axios.get(OMDB_BASE_URL, {
        params: {
            s: query,
            type: 'movie',
            page,
            apikey: process.env.OMDB_API_KEY,
        },
    });

    const data = response.data;
    if (data.Response === 'False') {
        return { movies: [], total: 0 };
    }

    const total = parseInt(data.totalResults) || 0;
    const results = data.Search || [];

    // Cache basic info for each result
    const movies = await Promise.all(
        results.map(async (item) => {
            const existing = await Movie.findOne({ imdbId: item.imdbID });
            if (existing) return existing;

            const newMovie = await Movie.create({
                imdbId: item.imdbID,
                title: item.Title,
                year: item.Year,
                poster: item.Poster !== 'N/A' ? item.Poster : '',
                cachedAt: new Date(),
            });
            return newMovie;
        })
    );

    return { movies, total };
};

module.exports = { getMovieById, searchMovies };
