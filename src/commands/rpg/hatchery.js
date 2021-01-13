const { MessageAttachment } = require('discord.js');
const { Command, HatcherysData, EggsData, MiscUtils, YachiruEmbed } = require('../..');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'incubadora',
            aliases: [ 'inc', 'hatchery', 'incubator' ],
            category: 'RPG',
            description: 'Mostra informações sobre sua incubadora.'
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
        const embed = new YachiruEmbed()
            .setTitle(hatchery.name)
            .attachFiles(attachment)
            .setThumbnail('attachment://' + hatchery.shortName + '.png')
            .addField('Ajuda:', `Use \`${this.prefix}chocar\` para chocar todos dragões da sua incubadora.`)
            .setFooter(author.tag, author.avatarIcon())
            .setTimestamp();

        let occupied = 0;
        for (let i = 0; i < hatchery.slots; i++)
        {
            let egg = (incubator.eggs || [])[i];
            let desc = `\`${i + 1}.\` **Slot vázio.**`;

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