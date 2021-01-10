const Utils = require('../utils')

module.exports = class Loader 
{
    constructor(opts, client) 
    {
        const options = Utils.createOptionHandler('Loader', opts);

        this.critical = options.optional('critical', false);
        this.preLoad = options.optional('preLoad', false);

        this.client = client;
    }

    load(client) 
    {
        return true;
    }

    log(...args) {
        return this.client.log(...args);
    }

    logError(...args) {
        return this.client.logError(...args);
    }
}