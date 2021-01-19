const { Command, YachiruEmbed, MiscUtils } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'verificar',
            aliases: [ 'verify', 'verify-payments' ],
            description: 'Verifique seus pagamentos caso tenha alguma fatura pendente.',
            category: 'Financeiro',
            tool: true
        });
    }

    async run(message)
    {
        const { guild, channel } = message;

        channel.startTyping()
            .catch(e => e);

        const preferences = await this.client.database.payments.findAll({
            query: {
                guild: guild.id
            }
        });

        let payments = [];
        for (let preference of preferences)
        {
            let query = {
                "external_reference": preference._id,
                limit: 50,
                status: 'approved'
            };

            const response = await this.client.mp.getPayments(query);

            if (response) 
            {
                payments = payments.concat(...response);
            }
        }

        const data = await this.client.database.guilds.findOne(guild.id, 'payments expiresAt');
        const guildPayments = data.payments;

        const filteredPayments = payments.filter(x => !guildPayments.includes(x.id));
        if (!filteredPayments.length)
        {
            channel.stopTyping(true);
            return message.reply(`Não há nenhum pagamento **novo** aprovado que não tenha sido computado até o momento.`);
        }

        let time = 0;
        for (let payment of filteredPayments)
        {
            let dataPayment = preferences.find(x => x._id == payment.external_reference);
            if (dataPayment)
                time+=dataPayment.time;
        }

        await this.client.database.guilds.update(guild.id, {
            $addToSet: {
                payments: {
                    $each: filteredPayments.map(x => x.id)
                }
            },
            expiresAt: data.expiresAt >= Date.now() ? data.expiresAt + time : Date.now() + time
        });

        const embed = new YachiruEmbed()
            .setTitle('Pagamentos Verificados!')
            .setThumbnail('https://freeiconshop.com/wp-content/uploads/edd/checkmark-flat.png')
            .setDescription([
                `Pagamentos aprovados: **${filteredPayments.length}**`,
                `Total de tempo ganho: **${MiscUtils.parseDuration(time, 2, [ 'd', 'h' ])}**`
            ])
            .setFooter(`Caso algum pagamento seu não tenha sido aprovado, use ${this.prefix}faturas para verificar o status dos pagamentos do servidor.`)
            .setTimestamp();

        message.reply(embed)
            .then(() => channel.stopTyping(true));
    }
}