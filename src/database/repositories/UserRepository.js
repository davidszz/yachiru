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
        return {
            level: 1,
            xp: 0,
            money: 0,
            dragons: [],
            inventory: {},
            structures: {},
            incubator: {},
            arena: {
                level: 1,
                nextDrag: {
                    id: '0001',
                    level: 4
                },
                battles: 0,
                wins: 0
            },
            dragonFood: 0,
            farms: [],
            equippedDragon: 9,
            badges: [],
            background: 1,
            personalText: '',
            lightTheme: false,
            job: {},
            lastDaily: 0,
            lastMessage: 0,
            ...(super.parse(entity) || {})
        }
    }
}

module.exports = UserRepository;