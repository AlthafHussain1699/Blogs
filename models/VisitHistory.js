const mongoose = require('mongoose')
const User = require('./user');
const  Blog  = require('./blog');

const visitHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: User },
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: Blog },
    visitedAt: { type: Date, default: Date.now }
});

const History = mongoose.model("History", visitHistorySchema);

module.exports = {History}