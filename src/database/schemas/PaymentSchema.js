const { Schema } = require('mongoose');

module.exports = new Schema({
    _id: String,
    guild: String,
    pref_id: String,
    price: Number,
    time: Number
});