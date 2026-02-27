const axios = require('axios');
const Movie = require('../models/Movie.model');

const translateText = async (text, targetLang = 'fr') => {
    try {
        const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        return response.data[0].map(segment => segment[0]).join('');
    } catch (error) {
        return text;
    }
};

const upgradePosterUrl = (url) => {
    if (!url || url === 'N/A') return url;
    return url.replace(/_SX\d+\.jpg$/i, '_SX1000.jpg');
};

const OMDB_BASE_URL = 'http://www.omdbapi.com/';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const getMovieById = async (query) => {
    const trimmedQuery = query.trim();
    const isImdbId = /^tt\d+$/.test(trimmedQuery);

    let cachedMovie;
    if (isImdbId) {
        cachedMovie = await Movie.findOne({ imdbId: trimmedQuery });
    } else {
        cachedMovie = await Movie.findOne({ title: { $regex: new RegExp(`^${trimmedQuery}$`, 'i') } });
    }

    if (cachedMovie) {
        const cacheAge = Date.now() - new Date(cachedMovie.cachedAt).getTime();
        if (cacheAge < CACHE_TTL_MS) {
            return cachedMovie;
        }
    }

    const params = {
        apikey: process.env.OMDB_API_KEY,
        plot: 'full',
    };
    if (isImdbId) params.i = trimmedQuery;
    else params.t = trimmedQuery;

    const response = await axios.get(OMDB_BASE_URL, { params });
    const { data } = response;

    if (data.Response === 'False') {
        throw new Error(data.Error || 'Film non trouvé sur OMDb avec cette recherche');
    }

    let { Title: title, Plot: plot, Genre: genreString, imdbRating, imdbID: imdbId, Year: year, Poster: poster, Director: director, Actors: actors, Runtime: runtime, Language: language, imdbVotes } = data;

    const originalTitle = title;
    const originalPlot = plot;
    const originalGenre = genreString ? genreString.split(', ') : [];
    let genres = [...originalGenre];

    try {
        if (plot && plot !== 'N/A') {
            plot = await translateText(plot, 'fr');
        }
        if (genres.length > 0) {
            const translatedGenres = await translateText(genres.join(', '), 'fr');
            genres = translatedGenres.split(', ');
        }
        title = await translateText(title, 'fr');
    } catch (error) { }

    const rating = parseFloat(imdbRating) || 0;

    const movieData = {
        imdbId,
        title,
        titleVO: originalTitle,
        year,
        genre: genres,
        genreVO: originalGenre,
        categories: genres,
        plot,
        plotVO: originalPlot,
        poster: poster !== 'N/A' ? upgradePosterUrl(poster) : '',
        director,
        actors,
        runtime,
        language,
        imdbRating: rating,
        imdbVotes,
        cachedAt: new Date(),
        isExplicitlyAdded: true,
    };

    return await Movie.findOneAndUpdate(
        { imdbId },
        movieData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

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

    const movies = await Promise.all(
        results.map(async (item) => {
            const existing = await Movie.findOne({ imdbId: item.imdbID });
            if (existing) return existing;

            let title = item.Title;
            try {
                title = await translateText(title, 'fr');
            } catch (err) { }

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

const getSuggestions = async (query) => {
    const response = await axios.get(OMDB_BASE_URL, {
        params: {
            s: query,
            type: 'movie',
            apikey: process.env.OMDB_API_KEY,
        },
    });

    const { data } = response;
    if (data.Response === 'False') {
        return [];
    }

    return (data.Search || []).slice(0, 5).map(item => ({
        imdbId: item.imdbID,
        title: item.Title,
        year: item.Year,
        poster: item.Poster !== 'N/A' ? upgradePosterUrl(item.Poster) : null
    }));
};

module.exports = { getMovieById, searchMovies, getSuggestions };
