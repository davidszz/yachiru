const { MessageAttachment, MessageEmbed } = require('discord.js');
const { Command, HatcherysData, EggsData, MiscUtils } = require('../..');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'hatchery',
            aliases: [ 'inc', 'incubadora', 'incubator' ],
            category: 'RPG',
            description: 'Abre sua incubadora atual.'
        });
    }

    async run({ channel, author })
    {
        const userdata = await this.client.database.users.findOne(author.id, 'incubator');
        
        const incubator = userdata.incubator;
        const hatchery = HatcherysData[incubator.id];

        if (!hatchery)
        {
            return channel.send(`Você não possui nenhuma incubadora.`);
        }

        const attachment = new MessageAttachment(hatchery.icon, hatchery.shortName + '.png');
        const embed = new MessageEmbed()
            .setColor('#0084FF')
            .setTitle(hatchery.name)
            .attachFiles(attachment)
            .setThumbnail('attachment://' + hatchery.shortName + '.png')
            .setFooter(author.tag, author.avatarIcon())
            .setTimestamp();

        let occupied = 0;
        for (let i = 0; i < hatchery.slots; i++)
        {
            let egg = (incubator.eggs || [])[i];
            let desc = `\`${i + 1}.\` **/// Slot vázio ///**`;

            if (egg) 
            {
                occupied++;

                let eggInfos = EggsData[egg.id];
                let calc = egg.endsAt - Date.now();

                desc = `\`${i + 1}.\` **${eggInfos.name}** \u00BB \`${calc > 0 ? MiscUtils.shortDuration(calc) : 'Pronto ✔️'}\``;
            }

            embed.setDescription([
                embed.description || '',
                desc
            ]);
        }

        embed.setTitle(embed.title + ` (${occupied}/${hatchery.slots})`);

        channel.send(author, embed);
    }
}