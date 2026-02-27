const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
    },
    visitedAt: {
        type: Date,
        default: Date.now,
    },
});

historySchema.index({ user: 1, visitedAt: -1 });

module.exports = mongoose.model('History', historySchema);
