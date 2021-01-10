const { MessageAttachment } = require('discord.js');
const { Command, CanvasTemplates, StructuresData } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'temples',
            aliases: [ 'templos' ],
            category: 'RPG',
            description: 'Veja seus templos já adquiridos.',
            usage: '[usuário]',
            examples: [
                '@Wumpus'
            ]
        });
    }

    async run(message, [ user ])
    {
        const { author, channel } = message;
        const target = user || author;

        channel.startTyping()
            .catch(e => e);
        const userdata = await this.client.database.users.findOne(target.id, 'structures');
        const structures = userdata.structures;

        const temples = Object.values(
            Object.fromEntries(
                Object.entries(StructuresData)
                    .filter(x => x[1].type == 'temple' && Object.values(structures).find(c => c.templeId == x[0]))
            )
        ).map(x => x.icon);

        const buffer = await CanvasTemplates.temples(temples);
        const attachment = new MessageAttachment(buffer, 'temples.png');
        
        if (user)
        {
            message.yachiruReply(`Templos de **${user.tag}**`, attachment);
        }
        else 
        {
            message.yachiruReply(attachment);
        }

        channel.stopTyping(true);
    }
}