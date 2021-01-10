const { Command, ItemsData, MiscUtils } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'sell',
            aliases: [ 'vender' ],
            category: 'RPG',
            description: 'Venda seus itens.',
            usage: '<item> [quantidade: 1]',
            examples: [
                'ovo de dragão de planta 3',
                'fazenda grande'
            ]
        });
    }

    async run({ channel, author }, args)
    {
        if (!args.length)
        {
            return channel.send(this.usageMessage());
        }

        const userdata = await this.client.database.users.findOne(author.id, 'inventory');
        if (!userdata.inventory || !Object.keys(userdata.inventory).length)
        {
            return channel.send('Você não possui nenhum item em seu inventário.');
        }

        const allItems = Object.values(ItemsData).flat().filter(i => userdata.inventory[i.id]);
        const fullArg = MiscUtils.alphaString(args.join(' ')).toLowerCase();

        const item = allItems
            .filter(i => fullArg.startsWith(MiscUtils.alphaString(i.name).toLowerCase()))
            .reduce((p, n) => p.name ? (n.name.length >= p.name.length ? n : p) : n, {});

        if (!item)
        {
            return channel.send('Nenhum item foi encontrado.');
        }

        if (item.sell == null)
        {
            return channel.send('Este item não pode ser vendido.');
        }

        let remainingArgs = fullArg.slice(item.name.length).trim();
        let amount = 1;

        if (remainingArgs)
        {
            amount = !isNaN(remainingArgs) && Number(remainingArgs) > 0 && Number.isInteger(Number(remainingArgs)) ? Number(remainingArgs) : 0;
            if (!amount)
            {
                return channel.send('Forneça uma quantidade válida acima de **0**.');
            }
        }

        const itemAmount = userdata.inventory[item.id].amount || 1;
        if (amount > itemAmount)
        {
            return channel.send(`Você não possui **${amount}** deste item.`);
        }

        const sellingTotal = parseInt(item.sell * amount);
        const updateItem = {};

        if (amount == itemAmount)
        {
            updateItem.$unset = {};
            updateItem.$unset[`inventory.${item.id}`] = '';
        }
        else 
        {
            updateItem.$inc = {};
            updateItem.$inc[`inventory.${item.id}.amount`] = -amount;
        }

        await this.client.database.users.update(author.id, {
            $inc: {
                money: sellingTotal
            },
            ...updateItem
        });

        channel.send(`Você vendeu **${amount == itemAmount ? 'todos(as)' : amount} ${item.name}** por **${MiscUtils.formatCurrency(sellingTotal)}**.`);
    }
}