const { red } = require('chalk');
const { EventListener } = require('../');

module.exports = class PaymentListener extends EventListener
{
    constructor(client)
    {
        super({
            events: [ 'paymentNotification' ]
        }, client);
    }

    async onPaymentNotification(paymentInfo)
    {
        if (!paymentInfo.data || !paymentInfo.data.id)
        {
            this.log('New payment notification: ' + paymentInfo, { color: 'red', tags: [ 'MercadoPago' ] });
            return;
        }

        const infos = await this.mp.getPayment(paymentInfo.data.id);
        if (!infos) return;

        const body = infos.body;
        if (body.status === 'approved')
        {
            const data = await this.database.payments.findOne(body.external_reference);
            const guildData = await this.database.guilds.findOne(data.guild, 'expiresAt payments');

            let time = guildData.expiresAt;
            let payments = guildData.payments || [];

            if (!payments.includes(body.id))
                payments.push(body.id);

            if (time > Date.now())
                time += data.time;
            else time = Date.now() + data.time;

            await this.database.guilds.update(data.guild, {
                expiresAt: time,
                payments
            });
        }
    }
}