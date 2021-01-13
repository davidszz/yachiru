const { MessageAttachment } = require('discord.js');
const { Command, MiscUtils, CanvasTemplates, XPUtils } = require('../../');
const Borders = require('../../assets/bin/data/borders.json');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'perfil',
            aliases: [ 'profile', 'p' ],
            description: 'Obtem o seu cartão de perfil.',
            category: 'Misc',
            usage: '[usuário]',
            examples: [
                '@Yachiru'
            ],
            canvas: true,
            parameters: [
                {
                    type: 'user',
                    acceptSelf: true,
                    acceptBot: false
                }
            ]
        });
    }

    async run(message, [ target ])
    {
        const { channel, author } = message;

        // const canvasPath = '../../utils/CanvasTemplates.js';
        // delete require.cache[require.resolve(canvasPath)];
        // const CanvasTemplates = require(canvasPath);

        const user = target || author;

        channel.startTyping()
            .catch(e => e);

        const userdata = await this.client.database.users.findOne(user.id);
        if (userdata.level == 1 && !userdata.xp)
        {
            if (user.id == author.id)
            {
                channel.send('Digite mais um pouco antes de abrir seu perfil.');
            }
            else 
            {
                channel.send(`**${user.tag}** precisa digitar um pouco mais para que o perfil dele seja criado.`);
            }

            return;
        }

        const userRank = await this.client.database.users.getIndex(author.id, {
            level: -1,
            xp: -1
        });

        let border = 1;
        for (let i in Borders)
        {
            let num = Number(i);

            if (userdata.level >= num)
            {
                border = num;
            }
        }

        const userDocument = {
            level: userdata.level,
            xp: userdata.xp,
            money: MiscUtils.formatCurrency(userdata.money),
            badges: userdata.badges || [],
            background: userdata.background || 1,
            job: 'Empresário',
            personalText: userdata.personalText,
            rank: userRank,
            nextLevelXp: XPUtils.needsXp(userdata.level),
            lightTheme: !!userdata.lightTheme,
            border
        };

        const buffer = await CanvasTemplates.profile(user || author, userDocument);
        const attachment = new MessageAttachment(buffer, 'profile.png');

        await message.yachiruReply(attachment);
        channel.stopTyping(true);
    }
}