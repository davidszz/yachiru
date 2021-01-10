const Repository = require('../Repository');
const ClanSchema = require('../schemas/ClanSchema');

class ClanRepository extends Repository
{
    constructor(mongoose)
    {
        super(mongoose, mongoose.model('Clan', ClanSchema));
    }

    parse(entity) 
    {
        return {
            moderators: [],
            members: {},
            clan: {},
            limit: 5,
            moneyUsers: {},
            ...(super.parse(entity) || {})
        }
    }
}

module.exports = ClanRepository;