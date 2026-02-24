const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Movie = require('./src/models/Movie.model');
const Rating = require('./src/models/Rating.model');
const Comment = require('./src/models/Comment.model');
const User = require('./src/models/User.model');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        try {
            console.log('Connected to DB. Starting cleanup...');
            const validMovies = await Movie.find({}, '_id').lean();
            const validIds = validMovies.map(m => m._id);

            const dr = await Rating.deleteMany({ movie: { $nin: validIds } });
            const dc = await Comment.deleteMany({ movie: { $nin: validIds } });

            let uc = 0;
            const users = await User.find();
            for (let u of users) {
                let changed = false;

                // Cleanup Favorites
                if (u.favorites && u.favorites.length > 0) {
                    const startFav = u.favorites.length;
                    u.favorites = u.favorites.filter(id => validIds.some(v => v.toString() === id.toString()));
                    if (u.favorites.length !== startFav) changed = true;
                }

                // Cleanup Watchlist
                if (u.watchlist && u.watchlist.length > 0) {
                    const startWatch = u.watchlist.length;
                    u.watchlist = u.watchlist.filter(id => validIds.some(v => v.toString() === id.toString()));
                    if (u.watchlist.length !== startWatch) changed = true;
                }

                // Cleanup History
                if (u.history && u.history.length > 0) {
                    const startHist = u.history.length;
                    u.history = u.history.filter(item => {
                        const mid = item.movie ? item.movie.toString() : null;
                        return mid && validIds.some(v => v.toString() === mid);
                    });
                    if (u.history.length !== startHist) changed = true;
                }

                if (changed) {
                    await u.save();
                    uc++;
                }
            }
            console.log(`Cleanup complete! Deleted Ratings: ${dr.deletedCount}, Comments: ${dc.deletedCount}, Users updated: ${uc}`);
        } catch (err) {
            console.error(err);
        } finally {
            process.exit(0);
        }
    })
    .catch(console.error);
