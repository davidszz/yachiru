const { MessageAttachment } = require('discord.js');
const { Command, CanvasTemplates } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'templos',
            aliases: [ 'temples' ],
            category: 'RPG',
            description: 'Veja os templos que você possui.',
            usage: '[usuário]',
            canvas: true,
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

    async run(message, [ user ])
    {
        const { author, channel } = message;
        const target = user || author;

        channel.startTyping()
            .catch(e => e);

        const userdata = await this.client.database.users.findOne(target.id, 'temples');
        const temples = userdata.temples
            .sort((a, b) => a.id - b.id)
            .map(x => this.client.items.get(x.id).icon);

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