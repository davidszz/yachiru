const { MessageAttachment } = require('discord.js');
const { Command, YachiruEmbed, MiscUtils } = require('../..');

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
        const userdata = await this.client.database.users.findOne(author.id, 'hatchery');
        const hatchery = userdata.hatchery;

        if (!hatchery.id)
        {
            return channel.send(`Você não possui nenhuma **incubadora**.`);
        }

        const infos = this.client.items.get(hatchery.id);
        const eggs = hatchery.eggs;

        const attachment = new MessageAttachment('src/assets/images/hatchery-1.png', 'hatchery.png');

        const embed = new YachiruEmbed(author);
        embed.attachFiles(attachment).setThumbnail('attachment://hatchery.png');
        embed.setTitle(infos.name);
        
        for (let i = 0; i < infos.eggsLimit; i++)
        {
            const id = i + 1;

            const egg = eggs[i];
            if (!egg)
            {
                embed.addDescription(`\`${id}.\` Vázio`);
                continue;
            }

            const dragon = this.client.dragons.get(egg.id);
            const time = egg.hatchAt - Date.now();
            const remaining = time > 0 ? MiscUtils.shortDuration(time, 2) : '`✔️`';

            embed.addDescription(`\`${eggs.indexOf(egg) + 1}.\` **${dragon.name}** \u00BB \`${remaining}\``);
        }

        embed.addDescription('');
        embed.addDescription(`\`${this.prefix}chocar\` para chocar os ovos.`);

        channel.send(embed);
    }
}