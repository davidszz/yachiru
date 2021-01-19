const MiscUtils = require('./MiscUtils');

module.exports = class MercadoPagoUtils extends MiscUtils
{
    static genExtRef(key = '')
    {
        let str = key ? key + '-' : '';
        return `${str}${super.randString(8)}-${super.randString(4)}-${super.randString(4)}-${super.randString(4)}-${super.randString(12)}`;
    }
}