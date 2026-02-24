const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Movie = require('./src/models/Movie.model');

const upgradePosterUrl = (url) => {
    if (!url || url === 'N/A') return url;
    // Replace default _SX300.jpg with _SX1000.jpg
    return url.replace(/_SX\d+\.jpg$/i, '_SX1000.jpg');
};

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB. Starting poster upgrade...');
        try {
            const movies = await Movie.find({ poster: { $regex: /_SX\d+\.jpg$/i } });
            console.log(`Found ${movies.length} movies to potentially upgrade.`);

            let count = 0;
            for (const movie of movies) {
                const oldUrl = movie.poster;
                const newUrl = upgradePosterUrl(oldUrl);

                if (oldUrl !== newUrl) {
                    movie.poster = newUrl;
                    await movie.save();
                    count++;
                }
            }

            console.log(`Poster upgrade complete! Updated ${count} movies.`);
        } catch (err) {
            console.error('Migration failed:', err);
        } finally {
            mongoose.disconnect();
            process.exit(0);
        }
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });
