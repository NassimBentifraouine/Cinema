const axios = require('axios');
const Movie = require('../models/Movie.model');

// Remove vitalets because of Node 16 fetch issues
const translateText = async (text, targetLang = 'fr') => {
    try {
        const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        return res.data[0].map(s => s[0]).join('');
    } catch (e) {
        console.warn('Google Translate custom API failed:', e.message);
        return text;
    }
};

/**
 * Replace OMDb default resolution suffix with a higher one.
 * Example: _SX300.jpg -> _SX1000.jpg
 */
const upgradePosterUrl = (url) => {
    if (!url || url === 'N/A') return url;
    return url.replace(/_SX\d+\.jpg$/i, '_SX1000.jpg');
};

const OMDB_BASE_URL = 'http://www.omdbapi.com/';
// Cache duration: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Fetch movie details by OMDb ID or Title, using DB cache.
 * @param {string} query (IMDb ID or Movie Title)
 * @returns {Promise<Object>} Movie document
 */
const getMovieById = async (query) => {
    // Determine if query is an IMDb ID (starts with tt followed by numbers)
    const isImdbId = /^tt\d+$/.test(query.trim());

    // Check cache
    let cached;
    if (isImdbId) {
        cached = await Movie.findOne({ imdbId: query.trim() });
    } else {
        // Find exact title match (case insensitive)
        cached = await Movie.findOne({ title: { $regex: new RegExp(`^${query.trim()}$`, 'i') } });
    }

    if (cached) {
        const age = Date.now() - new Date(cached.cachedAt).getTime();
        if (age < CACHE_TTL_MS) {
            return cached;
        }
    }

    // Build params for OMDb
    const params = {
        apikey: process.env.OMDB_API_KEY,
        plot: 'full',
    };
    if (isImdbId) params.i = query.trim();
    else params.t = query.trim();

    // Fetch from OMDb
    const response = await axios.get(OMDB_BASE_URL, { params });

    const data = response.data;
    if (data.Response === 'False') {
        throw new Error(data.Error || 'Film non trouvé sur OMDb avec cette recherche');
    }

    let genres = data.Genre ? data.Genre.split(', ') : [];
    let plot = data.Plot;
    let title = data.Title;

    const originalTitle = data.Title;
    const originalPlot = data.Plot;
    const originalGenre = data.Genre ? data.Genre.split(', ') : [];

    // Translation to French
    try {
        if (plot && plot !== 'N/A') {
            plot = await translateText(plot, 'fr');
        }
        if (genres.length > 0) {
            const trGenres = await translateText(genres.join(', '), 'fr');
            genres = trGenres.split(', ');
        }
        title = await translateText(title, 'fr');
    } catch (err) {
        console.error('Translation error:', err.message);
    }

    const rating = parseFloat(data.imdbRating) || 0;

    const movieData = {
        imdbId: data.imdbID,
        title: title,
        titleVO: originalTitle,
        year: data.Year,
        genre: genres,
        genreVO: originalGenre,
        categories: genres,
        plot: plot,
        plotVO: originalPlot,
        poster: data.Poster !== 'N/A' ? upgradePosterUrl(data.Poster) : '',
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
        { imdbId: data.imdbID },
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

            let title = item.Title;
            try {
                title = await translateText(title, 'fr');
            } catch (err) {
                console.error('Translation error on search:', err.message);
            }

            const newMovie = await Movie.create({
                imdbId: item.imdbID,
                title: title,
                year: item.Year,
                poster: item.Poster !== 'N/A' ? upgradePosterUrl(item.Poster) : '',
                cachedAt: new Date(),
            });
            return newMovie;
        })
    );

    return { movies, total };
};

/**
 * Get raw suggestions from OMDb without saving.
 * @param {string} query 
 * @returns {Promise<Array>}
 */
const getSuggestions = async (query) => {
    const response = await axios.get(OMDB_BASE_URL, {
        params: {
            s: query,
            type: 'movie',
            apikey: process.env.OMDB_API_KEY,
        },
    });

    const data = response.data;
    if (data.Response === 'False') {
        return [];
    }

    // Return the top 5 matches
    return (data.Search || []).slice(0, 5).map(item => ({
        imdbId: item.imdbID,
        title: item.Title,
        year: item.Year,
        poster: item.Poster !== 'N/A' ? upgradePosterUrl(item.Poster) : null
    }));
};

module.exports = { getMovieById, searchMovies, getSuggestions };
