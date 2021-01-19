const mongoose = require('mongoose');
const repositories = require('./repositories');

class Wrapper 
{
    constructor(options = {})
    {
        this.options = options;
        this.mongoose = mongoose;
    }

    async connect()
    {
        return mongoose.connect(process.env.MONGO_URI, this.options).then(m => {
            this.users = new repositories.User(m);
            this.clans = new repositories.Clan(m);
            this.counters = new repositories.Counter(m);
            this.guilds = new repositories.Guild(m);
            this.payments = new repositories.Payment(m);
        });
    }
}

module.exports = Wrapper;