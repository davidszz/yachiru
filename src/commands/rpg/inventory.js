const { MessageEmbed } = require('discord.js');
const { Command, ItemsData } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'inventory',
            aliases: [ 'inventario', 'inv', 'inventário' ],
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
            return channel.send('Você não possui **nenhum** item em seu inventário.');
        }

        const embed = new MessageEmbed()
            .setColor('#0084FF')
            .setAuthor(`Seu inventário`, author.avatarIcon())
            .addField('Ajuda:', `Para usar um item use \`${this.client.prefix}usar <item>\``)
            .setFooter(author.tag, author.avatarIcon())
            .setTimestamp();

        const allItems = Object.values(ItemsData).flat();
        const getItem = (id) => allItems.find(i => i.id == id);

        for (const key in inventory)
        {
            const infos = inventory[key];
            const item = getItem(key);

            embed.setDescription([
                embed.description || '',
                `**${item.name}:** \`${infos.amount || 1}\``
            ]);
        }

        channel.send(author, embed);
    }
}