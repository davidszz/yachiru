const { Schema } = require('mongoose');

module.exports = new Schema({
    _id: String,
    level: Number,
    xp: Number,
    money: Number,
    dragonFood: Number,
    dragons: Array,
    inventory: Object,
    hatchery: Object,
    farms: Array,
    temples: Array,
    arena: Object,
    badges: Array,
    background: Number,
    personalText: String,
    clan: Object,
    lightTheme: Boolean,
    job: Object,
    lastDaily: Number,
    lastMessage: Number
});