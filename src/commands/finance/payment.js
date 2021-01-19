const { Command, MercadoPagoUtils } = require('../..');

const BOT_PRICE = Number(process.env.BOT_PRICE) || 30;
const BOT_TIME = Number(process.env.BOT_TIME) || 2592000000;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'pagamento',
            aliases: [ 'payment' ],
            description: 'Crie um link de pagamento de 30 dias do bot.',
            category: 'Financeiro',
            tool: true
        });
    }

    async run(message)
    {
        const { guild, channel } = message;

        channel.startTyping()
            .catch(e => e);

        const data = await this.client.database.payments.findAll({
            query: {
                guild: guild.id
            }
        });

        let url = '';
        for (let paymentData of data)
        {
            if (paymentData.price != BOT_PRICE
                || paymentData.time != BOT_TIME)
                continue;

            let valid = await this.client.mp.validPreference(paymentData.pref_id);
            if (!valid) continue;

            url = 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=' + paymentData.pref_id;
        }

        if (!url)
        {
            const ext_ref = MercadoPagoUtils.genExtRef('yachiru_payment');
            const response = await this.client.mp.createPayment({
                title: 'Yachiru Bot - 30 Dias',
                price: BOT_PRICE,
                external_reference: ext_ref
            });

            if (!response)
            {
                return message.reply(`Ocorreu um erro ao criar um link de pagamento, por favor tente mais tarde ou contate um desenvolvedor do bot.`);
            }

            url = response.init_point;

            const pref_id = url.split('pref_id=')[1];

            await this.client.database.payments.update(ext_ref, {
                pref_id,
                guild: guild.id,
                time: 30 * 86400000,
                price: BOT_PRICE
            });
        }

        message.reply(url).then(() => {
            channel.stopTyping(true);
        });
    }
}