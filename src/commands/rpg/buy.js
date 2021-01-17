const { Command, MiscUtils } = require('../../');
const { formatCurrency } = require('../../utils/MiscUtils');
const { alphaString } = MiscUtils;

const isNum = (arg) => !isNaN(arg) && Number.isInteger(Number(arg)) && Number(arg) > 0;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'comprar',
            aliases: [ 'buy' ],
            category: 'RPG',
            description: 'Compre items da loja.',
            usage: '<id> [quantidade: 1]',
            examples: [
                '1',
                '1 10'
            ],
            parameters: [
                {
                    type: 'string',
                    validate: (val) => isNum(val),
                    errors: {
                        validate: 'Forneça o **id** de um item acima válido contendo **apenas números**.'
                    },
                    required: true
                },
                {
                    type: 'string',
                    validate: (val) => isNum(val),
                    errors: {
                        validate: 'A quantidade deve ser um **número** válido que não seja **zero**.'
                    }
                }
            ]
        });
    }

    async run(message, [ id, amount = 1 ])
    {
        const { channel, author } = message;

        amount = Number(amount);

        const item = this.client.items.get(id);        
        if (!item)
        {
            return channel.send(`Item não encontrado.`);
        }

        if (item.avaliable != null && !item.avaliable)
        {
            return channel.send(`Este item não pode ser **comprado**.`);
        }

        const userdata = await this.client.database.users.findOne(author.id, 'money level inventory farms');
        const inventory = userdata.inventory;
        
        if (item.level && userdata.level < item.level)
        {
            return channel.send(`Este item só pode ser adquirido apartir do nivel **${item.level}**.`);
        }

        if (item.max)
        {
            let has = 0;
            if (inventory[id])
            {
                has += inventory[id].amount || 1;
            }

            switch(item.type)
            {
                case 'farm':
                    for (let farm of userdata.farms)
                    {
                        if (farm.id == id)
                            has++;
                    }
                break;
            }

            if (has >= item.max)
            {
                return channel.send(`Você já possui o **máximo** permitido deste item.`);
            }

            if ((amount + has) > item.max)
            {
                let remaining = item.max - has;
                return channel.send(`Você só pode comprar mais **${remaining}x** deste item.`);
            }
        }

        const { price, name, xp = 0 } = item;

        const cost = price * amount;
        if (userdata.money < cost)
        {
            return channel.send(`Você não possui **${formatCurrency(cost)}** para comprar **${amount}x ${name}**.`);
        }

        const update = {
            $inc: {
                money: -cost,
                xp: xp,
                [`inventory.${id}.amount`]: amount
            }
        };

        await this.client.database.users.update(author.id, update);
        channel.send(`Você comprou **${amount}x ${name}** por **${formatCurrency(cost)}**.\nOs items comprados na loja são redirecionados ao inventário do usuário.`);
    }
}