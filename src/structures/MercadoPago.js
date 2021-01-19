const mercadopago = require('mercadopago');
const MercadoPagoUtils = require('../utils/MercadoPagoUtils');

module.exports = class MercadoPago
{
    constructor(client)
    {
        this.client = client;
        
        mercadopago.configure({
            access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
        });
    }

    async createPayment(options)
    {
        if (!options.title)
        {
            return this.logError('Payment needs a title');
        }

        const title = options.title;
        const description = options.description || '';
        const quantity = options.quantity || 1;
        const unit_price = options.price || 1;
        const ext_ref = options.external_reference;

        const preference = {
            items: [
                {
                    title,
                    description,
                    quantity,
                    unit_price
                }
            ]
        };

        if (ext_ref)
        {
            preference['external_reference'] = ext_ref;
        }

        const payment = await mercadopago.preferences.create(preference).catch(() => null);
        return payment && payment.body || payment;
    }

    async getPayments(query = {})
    {
        const payments = await mercadopago.payment.search({
            qs: query
        }); 

        return payments && payments.body && payments.body.results ? payments.body.results : [];
    }

    async validPreference(id)
    {
        const response = await mercadopago.preferences.get(id).catch(() => null);
        return response && response.body && response.body.id ? true : false;
    }

    async getGuildPayments(guild_id, status = '')
    {
        const preferences = await this.client.database.payments.findAll({
            query: {
                guild: guild_id
            }
        });

        let payments = [];
        for (let preference of preferences)
        {
            let query = {
                "external_reference": preference._id,
                limit: 50
            };
            if (status) query.status = status;

            const response = await this.getPayments(query);

            if (response) {
                payments = payments.concat(...response);
            }
        }

        return payments;
    }

    log(...args)
    {
        this.client.log(...args);
    }

    logError(...args)
    {
        this.client.logError(...args);
    }
}