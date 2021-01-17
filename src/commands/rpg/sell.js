const { Command, MiscUtils } = require('../../');
const { formatCurrency, formatNumber } = MiscUtils;

const isNum = (val) => !isNaN(val) && Number.isInteger(Number(val)) && Number(val) > 0;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'vender',
            aliases: [ 'sell' ],
            category: 'RPG',
            description: 'Venda seus itens!',
            usage: '<id> [quantidade: 1]',
            examples: [
                '1011',
                '1011 2'
            ],
            parameters: [
                {
                    type: 'string',
                    validate: (val) => isNum(val),
                    errors: {
                        validate: 'Por favor forneça um **id** válido de um item.'
                    },
                    required: true
                },
                {
                    type: 'string',
                    validate: (val) => isNum(val),
                    errors: {
                        validate: 'Forneça uma quantidade **válida** acima de **0**'
                    }
                }
            ]
        });
    }

    async run(message, [ id, amount = 1 ])
    {
        const author = message.author;
        const { inventory } = await this.client.database.users.findOne(author.id, 'inventory');

        const item = inventory[id];
        if (!item)
        {
            return message.reply(`nenhum item foi encontrado com esse **id**.`);
        }
        
        const infos = this.client.items.get(id);
        if (!infos.sell)
        {
            return message.reply(`esse item não pode ser vendido.`);
        }

        amount = Number(amount);
        if (!item.amount || amount > item.amount)
        {
            return message.reply(`você não tem **${amount}x** deste item.`);
        }

        const earned = parseInt(amount * infos.sell);
        
        const update = {
            $inc: {
                money: earned
            }
        };

        if (!(item.amount - amount))
        {
            update['$unset'] = {
                [`inventory.${id}`]: ''
            };
        }
        else    
        {
            update['$inc'][`inventory.${id}.amount`] = -amount
        }

        await this.client.database.users.update(author.id, update);
        message.reply(`você vendeu **${amount}x ${infos.name}** por **${formatCurrency(earned)}**!`);
    }
}