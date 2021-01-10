const Utils = require('../utils')

module.exports = class EventListener 
{
    constructor (opts, client) 
    {
        const options = Utils.createOptionHandler('EventListener', opts);

        this.events = options.required('events');
        this.client = client;
    }
}