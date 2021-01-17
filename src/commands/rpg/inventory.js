const { Command, YachiruEmbed, MiscUtils } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'inventario',
            aliases: [ 'inventory', 'inv', 'inventário' ],
            category: 'RPG',
            description: 'Abre seu inventário.'
        });
    }

    async run({ channel, author })
    {
        const userdata = await this.client.database.users.findOne(author.id, 'money inventory');
        const inventory = userdata.inventory;

        if (!Object.keys(inventory).length)
        {
            return channel.send('Você não possui nenhum item em seu inventário.');
        }

        const embed = new YachiruEmbed(author);
        embed.setTitle('Seu inventário');

        for (const id in inventory)
        {
            const invItem = inventory[id];
            const item = this.client.items.get(id);

            embed.addDescription(`\`${id}.\` ${item.name} **(${invItem.amount})**`);
        }

        embed.addDescription('');
        embed.addDescription(`**Dinheiro:** ${MiscUtils.formatCurrency(userdata.money)}`);

        channel.send(author, embed);
    }
}