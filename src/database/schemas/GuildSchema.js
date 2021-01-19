const { Schema } = require('mongoose');

module.exports = new Schema({
    _id: String,
    expiresAt: Number,
    payments: Array,
    commandsChannel: String
});