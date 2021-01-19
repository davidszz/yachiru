const { Loader, MercadoPago } = require('../');

module.exports = class MercadoPagoLoader extends Loader 
{
    constructor(client)
    {
        super({
            preLoad: true
        }, client);
    }

    async load()
    {
        try 
        {
            this.client.mp = new MercadoPago(this.client);
            this.log('Connection estabilished!', { color: 'green', tags: [ 'MercadoPago' ] });
            return true;
        }
        catch(err)
        {
            this.logError(err);
        }

        return false;
    }
}