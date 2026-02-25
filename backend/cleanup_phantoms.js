const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Movie = require('./src/models/Movie.model');

async function cleanup() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Identify movies that SHOULD be explicitly added (have full details)
        // We'll mark movies that have a plot and genre (non-skeleton)
        const updateResult = await Movie.updateMany(
            {
                $and: [
                    { plot: { $exists: true, $ne: '' } },
                    { genre: { $exists: true, $not: { $size: 0 } } }
                ]
            },
            { $set: { isExplicitlyAdded: true } }
        );
        console.log(`Updated ${updateResult.modifiedCount} movies to isExplicitlyAdded: true`);

        // 2. Identify "phanoms" (skeletons with no plot or genre) and delete them
        // to clean up the DB from unused search results
        const deleteResult = await Movie.deleteMany({
            $or: [
                { plot: { $exists: false } },
                { plot: '' },
                { genre: { $exists: false } },
                { genre: { $size: 0 } }
            ],
            isExplicitlyAdded: { $ne: true }
        });
        console.log(`Deleted ${deleteResult.deletedCount} phantom movies.`);

        console.log('Cleanup finished.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
