const { EventListener, MiscUtils, NodeMailer } = require('../');
const { readFileSync } = require('fs');

const payment_types = {
    'account_money': 'Saldo do Mercado Pago',
    'ticket': 'Boleto Bancário',
    'bank_transfer': 'Transferência Bancária',
    'atm': 'Caixa Eletrônico',
    'credit_card': 'Cartão de Crédito',
    'debit_card': 'Cartão de Débito',
    'prepaid_card': 'Cartão PréPago'
};

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
        if (!paymentInfo.type && !paymentInfo.id)
        {
            this.log('New payment notification: ' + paymentInfo, { color: 'red', tags: [ 'MercadoPago' ] });
            return;
        }

        const infos = await this.mp.getPayment(paymentInfo.id);
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

            const guild = this.guilds.cache.get(data.guild) || await this.guilds.fetch(data.guild).catch(() => null);
            this.log(`(${(new Date()).toLocaleString('pt-BR')}) New payment received from <${guild && guild.name || 'GUILD'}>(${data.guild}) - ${MiscUtils.formatCurrency(data.price)}`);

            const email = body.payer && body.payer.email;
            if (email)
            {
                this.log(`Sending an email with payment infos to ${email}...`, { color: 'yellow', tags: [ 'Yachiru Payments' ] });

                const mailHtml = readFileSync('src/assets/mails/payment-success.html', 'utf8')
                    .replace('{id}', body.id)
                    .replace('{product}', body.description)
                    .replace('{price}', MiscUtils.formatCurrency(body.transaction_amount))
                    .replace('{status}', 'Aprovado')
                    .replace('{details}', 'Credenciado')
                    .replace('{date}', new Date(body.date_approved).toLocaleString('pt-BR'))
                    .replace('{payment_type}', payment_types[body.payment_type_id]);

                const response = await NodeMailer.sendMail({
                    to: email,
                    subject: 'Pagamento Aprovado',
                    html: mailHtml
                });

                if (response)
                {
                    this.log(`Mail as been sended to <${email}> with payment information`, { color: 'magenta', tags: [ 'Yachiru Payments' ] });
                }
                else 
                {
                    this.log(`Failed to send mail to <${email}> with payment informations.`, { color: 'red', tags: [ 'Yachiru Payments', 'Error' ] });
                }
            }
        }
    }
}