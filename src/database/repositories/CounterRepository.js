const Repository = require('../Repository');
const CounterSchema = require('../schemas/CounterSchema');

class CounterRepository extends Repository
{
    constructor(mongoose)
    {
        super(mongoose, mongoose.model('Counter', CounterSchema));
    }

    parse(entity) 
    {
        return {
            seq: 0,
            ...(super.parse(entity) || {})
        }
    }
}

module.exports = CounterRepository;