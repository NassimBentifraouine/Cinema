const Movie = require('../models/Movie.model');
const Rating = require('../models/Rating.model');
const Comment = require('../models/Comment.model');
const User = require('../models/User.model');
const omdbService = require('./omdb.service');

const getMovies = async ({ search, genre, minRating, sort, page, limit, autoImport = true }) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { plot: { $regex: search, $options: 'i' } },
        ];
    }

    if (genre) {
        query.genre = { $in: [genre] };
    }

    if (minRating) {
        query.imdbRating = { $gte: parseFloat(minRating) };
    }

    let sortObj = { cachedAt: -1 };
    if (sort === 'rating') sortObj = { imdbRating: -1 };
    else if (sort === 'date') sortObj = { year: -1 };
    else if (sort === 'title') sortObj = { title: 1 };

    if (!search && !genre && !minRating) {
        query.isExplicitlyAdded = true;
    }

    if (search && autoImport) {
        const localCount = await Movie.countDocuments(query);
        if (localCount === 0) {
            await omdbService.searchMovies(search, 1);
        }
    }

    const pipeline = [
        { $match: query },
        {
            $lookup: {
                from: Rating.collection.name,
                localField: '_id',
                foreignField: 'movie',
                as: 'communityRatings'
            }
        },
        {
            $addFields: {
                communityRating: {
                    $cond: [
                        { $gt: [{ $size: "$communityRatings" }, 0] },
                        { $round: [{ $avg: "$communityRatings.score" }, 1] },
                        0
                    ]
                },
                communityVotes: { $size: "$communityRatings" }
            }
        },
        { $project: { communityRatings: 0 } },
        { $sort: sortObj },
        { $skip: skip },
        { $limit: limitNum }
    ];

    const [movies, total] = await Promise.all([
        Movie.aggregate(pipeline),
        Movie.countDocuments(query),
    ]);

    return {
        movies,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
    };
};

const getMovieDetail = async (movieId) => {
    let movie;
    if (movieId.startsWith('tt')) {
        movie = await omdbService.getMovieById(movieId);
    } else {
        movie = await Movie.findById(movieId);
    }

    if (!movie) throw Object.assign(new Error('Film non trouvé'), { statusCode: 404 });

    const ratings = await Rating.find({ movie: movie._id });
    const count = ratings.length;
    const average = count > 0
        ? (ratings.reduce((acc, curr) => acc + curr.score, 0) / count).toFixed(1)
        : 0;

    const movieObj = movie.toObject ? movie.toObject() : movie;

    return {
        ...movieObj,
        communityRating: parseFloat(average),
        communityVotes: count,
    };
};

const createMovie = async (data) => {
    if (data.imdbId) {
        return await omdbService.getMovieById(data.imdbId);
    }
    return Movie.create({ ...data, isExplicitlyAdded: true });
};

const updateMovie = async (id, data) => {
    const movie = await Movie.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!movie) throw Object.assign(new Error('Film non trouvé'), { statusCode: 404 });
    return movie;
};

const deleteMovie = async (id) => {
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) throw Object.assign(new Error('Film non trouvé'), { statusCode: 404 });

    await Rating.deleteMany({ movie: id });
    await Comment.deleteMany({ movie: id });
    await User.updateMany(
        {},
        {
            $pull: {
                favorites: id,
                watchlist: id,
                history: { movie: id }
            }
        }
    );

    return movie;
};

const getComments = async (movieId) => {
    return Comment.find({ movie: movieId })
        .populate('user', 'email _id')
        .sort({ createdAt: -1 });
};

const addComment = async (userId, movieId, text) => {
    return Comment.create({
        user: userId,
        movie: movieId,
        text
    });
};

const deleteComment = async (commentId, userId, role) => {
    const comment = await Comment.findById(commentId);
    if (!comment) throw Object.assign(new Error('Commentaire non trouvé'), { statusCode: 404 });

    if (comment.user.toString() !== userId.toString() && role !== 'ADMIN') {
        throw Object.assign(new Error('Non autorisé à supprimer ce commentaire'), { statusCode: 403 });
    }

    await Comment.findByIdAndDelete(commentId);
    return { success: true };
};

module.exports = { getMovies, getMovieDetail, createMovie, updateMovie, deleteMovie, getComments, addComment, deleteComment };
