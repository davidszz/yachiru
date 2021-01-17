const Repository = require('../Repository');
const UserSchema = require('../schemas/UserSchema');

class UserRepository extends Repository
{
    constructor(mongoose)
    {
        super(mongoose, mongoose.model('User', UserSchema));
    }

    parse(entity) 
    {
        return super.assign({
            // User settings
            level: 1,
            xp: 0,
            money: 0,
            background: 1,
            personalText: '',
            lightTheme: false,
            lastMessage: 0,
            hatchery: {
                eggs: []
            },
            badges: [],
            job: {},
            lastDaily: 0,
            inventory: {},

            // RPG: Dragons
            dragons: [],
            arena: {
                level: 1,
                nextDrag: {
                    id: '1020',
                    level: 4
                },
                battles: 0,
                wins: 0
            },
            dragonFood: 0,

            // RPG: Structures
            farms: [],
            temples: []
        }, super.parse(entity) || {});
    }
}

module.exports = UserRepository;