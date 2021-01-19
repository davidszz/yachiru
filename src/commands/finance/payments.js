const { Command, YachiruEmbed, MiscUtils } = require('../../');

module.exports = class extends Command
{
    constructor(...args)
    {
        super(...args, {
            name: 'pagamentos',
            aliases: [ 'payments', 'faturas' ],
            description: 'Obtem as faturas do servidor.',
            category: 'Financeiro',
            tool: true
        });
    }

    async run(message)
    {
        const { guild, channel } = message;

        channel.startTyping()
            .catch(e => e);

        const payments = await this.client.mp.getGuildPayments(guild.id);

        if (!payments.length) {
            return channel.send('O servidor atual não possui nenhum pagamento.');
        }

        const embed = new YachiruEmbed()
            .setTitle('Suas faturas');

        for (const payment of payments)
        {
            const statusType = {
                'approved': 'Aprovado',
                'rejected': 'Recusado',
                'pending': 'Pendente'
            };

            const price = MiscUtils.formatCurrency(payment.transaction_amount);
            const date = payment.date_approved
                ? (new Date(payment.date_approved)).toLocaleString()
                : (new Date(payment.date_created)).toLocaleString();

            embed.setDescription([
                embed.description || '',
                '',
                `**ID:** ${payment.id} | **${price}**`,
                `Status: \`${statusType[payment.status] || payment.status}\` Data: \`${date}\``
            ]);
        }

        channel.send(embed)
            .then(() => {
                channel.stopTyping(true);
            })
    }
}