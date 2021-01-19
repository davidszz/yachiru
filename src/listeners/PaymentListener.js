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
        let first = await this.mp.getPayment(paymentInfo.id);
        let second = await this.mp.getPayment(paymentInfo.data.id);

        console.log('first', first);
        console.log('second', second);
    }
}