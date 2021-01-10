const { MessageEmbed } = require('discord.js');
const { Command, MiscUtils } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'food',
            aliases: [ 'comida' ],
            category: 'RPG',
            usage: '[usuário]',
            examples: [
                '@Wumpus'
            ],
            parameters: [
                {
                    type: 'user',
                    acceptSelf: true
                }
            ]
        });
    }

    async run({ channel, author }, [ user ])
    {
        const target = user || author;
        const userdata = await this.client.database.users.findOne(target.id, 'dragonFood');

        const food = MiscUtils.formatNumber(userdata.dragonFood);
        channel.send(`**${user ? user.tag : 'Você'}** possui **\`${food} 🍒\`**`);
    }
}