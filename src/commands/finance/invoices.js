const { Command, YachiruEmbed, MiscUtils, Constants } = require('../..');
const Emojis = Constants.emojis;
const getReaction = Constants.reaction;

const STATUS = {
    'approved': 'Aprovado ✔️',
    'rejected': 'Rejeitado ❌',
    'pending': 'Pendente 🕛',
    'authorized': 'Autorizado 🟢',
    'in_process': 'Sendo revisado 👁️‍🗨️',
    'in_mediation': 'Disputa ⚔️',
    'cancelled': 'Cancelado ✖️',
    'refunded': 'Reembolsado 😢',
    'charged_back': 'Estornado ✋'
};

module.exports = class extends Command
{
    constructor(...args)
    {
        super(...args, {
            name: 'faturas',
            aliases: [ 'invoices', 'pagamentos', 'payments' ],
            description: 'Obtem as faturas do servidor.',
            category: 'Financeiro',
            usage: '[id]',
            examples: [ '1' ],
            parameters: [
                {
                    type: 'string',
                    validate: (val) => !isNaN(val) && Number(val) > 0 && Number.isInteger(Number(val)),
                    errors: {
                        validate: 'Por favor forneça um id de uma fatura **válida** acima de **0**.'
                    }
                }
            ],
            permissions: [ 'ADMINISTRATOR' ],
            tool: true
        });
    }

    async run(message, [ id ])
    {
        const self = this;
        const { guild, channel, author } = message;

        channel.startTyping()
            .catch(e => e);

        if (id)
        {
            let payment = await this.client.mp.getPayment(id);
            let data = await this.client.database.payments.findAll({
                query: {
                    guild: guild.id
                }
            });

            if (!payment || !data.find(x => x._id == payment.body.external_reference))
            {
                return message.reply(`nenhuma fatura com esse id foi encontrada.`);
            }

            payment = payment.body;

            const colors = {
                'approved': '#00FF00',
                'rejected': '#FF0000',
                'pending': '#ffb217'
            };

            const icons = {
                'approved': 'https://cdn3.iconfinder.com/data/icons/miscellaneous-80/60/check-512.png',
                'rejected': 'https://cdn.clipart.email/eddae07562547beac65cdc7d9b2d1021_soylent-red-x-mark-3-icon-free-soylent-red-x-mark-icons_256-256.png',
                'pending': 'https://uxwing.com/wp-content/themes/uxwing/download/13-time-date/pending-clock.png'
            };

            const types = {
                'account_money': 'Saldo do Mercado Pago',
                'ticket': 'Boleto Bancário',
                'bank_transfer': 'Transferência Bancária',
                'atm': 'Caixa Eletrônico',
                'credit_card': 'Cartão de Crédito',
                'debit_card': 'Cartão de Débito',
                'prepaid_card': 'Cartão PréPago'
            };

            const embed = new YachiruEmbed(author)
                .setColor(colors[payment.status] || '#FFFFFF')
                .setThumbnail(icons[payment.status] || 'https://cdn2.iconfinder.com/data/icons/web-seo-16/32/Await_WorkAssigned_impending_wait_interactions-512.png')
                .setTitle(`Fatura ${payment.id}`)
                .setDescription(`Caso seu pagamento tenha sido aprovado mas não tenha sido computado, use \`${this.prefix}verificar\` para liberar o pagamento.`)
                .addField('Cobrança:', MiscUtils.formatCurrency(payment.transaction_amount), true)
                .addField('Tipo de pagamento:', types[payment.payment_type_id], true)
                .addField(`Status:`, `\`${STATUS[payment.status]}\``, true)
                .addField(`Criado:`, (new Date(payment.date_created)).toLocaleString('pt-BR'), true);

            if (payment.status === 'approved')
            {
                embed.addField('Aprovado:', (new Date(payment.date_approved)).toLocaleString('pt-BR'), true);
            }

            channel.stopTyping(true);
            return message.reply(embed);
        }

        var payments = await this.client.mp.getGuildPayments(guild.id);
        if (!payments.length) 
        {
            return message.reply('o servidor atual não possui nenhum pagamento.');
        }

        payments = payments.sort((a, b) => b.id - a.id);

        var emojis = [ Emojis.back, Emojis.previous, Emojis.next, Emojis.skip, Emojis.times ]
            .map(x => Constants.parseEmoji(x));

        var pages = Math.floor(payments.length / 5);
        var page = 1;

        channel.stopTyping(true);
        message.reply(embedPage())
            .then(async msg => {
                for (const emoji of emojis)
                    await msg.react(emoji)
                        .catch(e => e);

                const filter = (r, u) => u.id === author.id && Object.values(r.emoji).some(x => emojis.includes(x));
                const collector = msg.createReactionCollector(filter, { idle: 60000 });

                collector.on('collect', async (r, u) => {
                    const emoji = emojis.includes(r.emoji.id)
                        ? r.emoji.id : r.emoji.name;

                        if (emoji == getReaction('previous'))
                        {
                            if (page - 1 >= 1)
                            {
                                await msg.edit(embedPage(page - 1))
                                    .catch(e => e);
                            }
                        }
            
                        if (emoji == getReaction('next'))
                        {
                            if (page + 1 <= pages)
                            {
                                await msg.edit(embedPage(page + 1))
                                    .catch(e => e);
                            }
                        }
            
                        if (emoji == getReaction('back'))
                        {
                            if (page > 1)
                            {
                                await msg.edit(embedPage(1))
                                    .catch(e => e);
                            }
                        }
            
                        if (emoji == getReaction('skip'))
                        {
                            if (page < pages)
                            {
                                await msg.edit(embedPage(pages))
                                    .catch(e => e);
                            }
                        }
            
                        if(emoji == getReaction('times'))
                        {
                            collector.stop();
                            return msg.del();
                        }

                    r.users.remove(u)
                        .catch(e => e);
                });
            });

        function embedPage(num = 1)
        {
            page = num;
            
            const embed = new YachiruEmbed(author)
                .setTitle(`Faturas ${guild.name}`)
                .setThumbnail('https://img.icons8.com/plasticine/2x/invoice-1.png');

            let calc = num * 5;
            for (let i = calc - 5; i < calc; i++)
            {
                let payment = payments[i];
                if (!payment) continue;

                let date = payment.date_approved
                    ? new Date(payment.date_approved)
                    : new Date(payment.date_created);

                let desc = `\n\`${payment.id}\``;
                desc += ` \u2022 *${MiscUtils.fromNow(date.getTime())}*`;
                desc += `\n**${MiscUtils.formatCurrency(payment.transaction_amount)}** - Status: \`${STATUS[payment.status]}\``;

                embed.addDescription(desc);
            }

            embed.addDescription([
                '',
                `**Página ${num}/${pages}**`,
                '',
                `\`${self.fullname} ${self.usage}\` para obter informações sobre uma fatura.`
            ]);

            return embed;
        }
    }
}