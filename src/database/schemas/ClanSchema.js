const { Schema } = require('mongoose');

module.exports = new Schema({
    _id: Number,
    tag: String,
    name: String,
    owner: String,
    moderators: Array,
    members: Object,
    limit: Number,
    moneyUsers: Object
});