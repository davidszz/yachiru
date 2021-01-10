const Wrapper = require('../database/Wrapper');
const pjson = require('../../package.json');
const { Loader } = require('..');

class Database extends Loader
{
    constructor(client)
    {
        super({
            preLoad: true
        }, client);

        this.database = null;
    }

    async load()
    {
        try
        {
            await this.initialize(Wrapper, { 
                useNewUrlParser: true, 
                useUnifiedTopology: true, 
                useFindAndModify: true 
            });

            this.client.database = this.database;

            this.client.counters = {
                async sequence(name)
                {
                    var res = await this.database.counters.findAndUpdate(name, {
                        $inc: { seq: 1 }
                    });
    
                    return res.seq;
                }
            };
            this.client.counters.sequence = this.client.counters.sequence.bind(this.client);

            return !!this.database;
        }
        catch (err)
        {
            this.logError(err);
        }

        return false;
    }

    async initialize(Mongo, options = {})
    {
        this.database = new Mongo(options);
        
        return this.database.connect().then(() => {
            console.log('-'.repeat(40));
            this.client.log('Database connection estabilished!', { color: 'magenta', tags: [ 'MONGO' ] });
            this.client.log('Version: ' + pjson.dependencies.mongoose.replace('^', ''), { color: 'magenta', tags: [ 'MONGO' ] });
            console.log('-'.repeat(40));
        }).catch(e => {
            this.logError(e);
            console.log('-'.repeat(25));
            this.database = null;
        });
    }
}

module.exports = Database;