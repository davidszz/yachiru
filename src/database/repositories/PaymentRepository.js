const Repository = require('../Repository');
const PaymentSchema = require('../schemas/PaymentSchema');

class PaymentRepository extends Repository
{
    constructor(mongoose)
    {
        super(mongoose, mongoose.model('Payment', PaymentSchema));
    }

    parse(entity) 
    {
        return {
            price: 100,
            time: 30 * 86400000,
            ...(super.parse(entity) || {})
        }
    }
}

module.exports = PaymentRepository;