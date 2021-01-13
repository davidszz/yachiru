const Repository = require('../Repository');
const GuildSchema = require('../schemas/GuildSchema');

class GuildRepository extends Repository
{
    constructor(mongoose)
    {
        super(mongoose, mongoose.model('Guild', GuildSchema));
    }

    parse(entity) 
    {
        return {
            commandsChannel: '',
            ...(super.parse(entity) || {})
        }
    }
}

module.exports = GuildRepository;