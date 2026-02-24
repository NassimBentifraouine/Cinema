const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: './.env' });
const Movie = require('./src/models/Movie.model');

const OMDB_BASE_URL = 'http://www.omdbapi.com/';

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB. Starting VO backfill...');
        try {
            // Find movies missing titleVO or plotVO
            const movies = await Movie.find({
                $or: [
                    { titleVO: { $exists: false } },
                    { titleVO: '' },
                    { plotVO: { $exists: false } },
                    { plotVO: '' }
                ]
            });

            console.log(`Found ${movies.length} movies to backfill VO data.`);

            let count = 0;
            for (const movie of movies) {
                if (!movie.imdbId) continue;

                console.log(`Fetching VO for: ${movie.title} (${movie.imdbId})`);
                try {
                    const res = await axios.get(OMDB_BASE_URL, {
                        params: {
                            i: movie.imdbId,
                            apikey: process.env.OMDB_API_KEY,
                            plot: 'full'
                        }
                    });

                    if (res.data.Response === 'True') {
                        movie.titleVO = res.data.Title;
                        movie.plotVO = res.data.Plot;
                        movie.genreVO = res.data.Genre ? res.data.Genre.split(', ') : [];
                        await movie.save();
                        count++;
                    }
                } catch (err) {
                    console.error(`Failed to fetch VO for ${movie.imdbId}:`, err.message);
                }
                // Rate limit protection
                await new Promise(r => setTimeout(r, 200));
            }

            console.log(`VO backfill complete! Updated ${count} movies.`);
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
