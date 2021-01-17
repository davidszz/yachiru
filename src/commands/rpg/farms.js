const { Command, MiscUtils, Constants, YachiruEmbed } = require('../../');

const Emojis = Constants.emojis;
const getReaction = Constants.reaction;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'fazendas',
            aliases: [ 'farms' ],
            category: 'RPG',
            description: 'Veja como estão suas fazendas.'
        });
    }

    async run({ channel, author })
    {
        const self = this;

        const farms = await this.client.database.users.findOne(author.id, 'farms')
            .then(res => res.farms);

        if (!farms.length)
        {
            return channel.send(`Você não possui nenhuma **fazenda**.`);
        }

        var limit = 6;
        var pages = Math.ceil(farms.length / limit);
        var page = 1;

        const msg = await channel.send(paginatedEmbed());
        if (pages <= 1) return;

        const emojis = [ Emojis.back, Emojis.previous, Emojis.next, Emojis.skip, Emojis.times ]
            .map(x => Constants.parseEmoji(x));

        for (const emoji of emojis)
        {
            await msg.react(emoji).catch(e => e);
        }

        const filter = (r, u) => u.id === author.id && Object.values(r.emoji).some(x => emojis.includes(x));
        const collector = msg.createReactionCollector(filter, { idle: 60000 });

        collector.on('collect', async (r, u) => {
            const emoji = emojis.includes(r.emoji.id)
                ? r.emoji.id : r.emoji.name;

            if (emoji == getReaction('previous'))
            {
                if (page - 1 >= 1)
                {
                    await msg.edit(paginatedEmbed(page - 1))
                        .catch(e => e);
                }
            }

            if (emoji == getReaction('next'))
            {
                if (page + 1 <= pages)
                {
                    await msg.edit(paginatedEmbed(page + 1))
                        .catch(e => e);
                }
            }

            if (emoji == getReaction('back'))
            {
                if (page > 1)
                {
                    await msg.edit(paginatedEmbed(1))
                        .catch(e => e);
                }
            }

            if (emoji == getReaction('skip'))
            {
                if (page < pages)
                {
                    await msg.edit(paginatedEmbed(pages))
                        .catch(e => e);
                }
            }

            if(emoji == getReaction('times'))
            {
                collector.stop();
                return msg.del();
            }

            r.users.remove(u)
                .catch(e => e);
        }); 

        function paginatedEmbed(num = 1)
        {
            page = num;

            const embed = new YachiruEmbed(author)
                .setTitle(`Fazendas ${num} de ${pages}`)
                .setDescription(`Para colher alguma plantação use \`${self.prefix}colher <id ou tudo>\`\n`)

            const calc = limit * num;
            for (let i = (calc - limit); i < calc; i++)
            {
                const farm = farms[i];
                if (!farm) continue;

                const { name, foodProduction, productionCooldown, emoji } = self.client.items.get(farm.id);

                const time = Date.now() - farm.lastHarvest;
                const remaining = (productionCooldown * 1000) - time;
                const emoji_ = emoji ? `${emoji} ` : '';

                const id = (i + 1).toString();

                let desc = `\`${`${id}.`.padStart(farms.length.toString().length + 1, ' ')}\``;
                desc += ` ${emoji_}**${name}** \u00BB`;
                desc += ` \`${remaining > 0 ? MiscUtils.shortDuration(remaining, 2) : `${foodProduction} 🍒`}\``;

                embed.addDescription(desc);
            }

            return embed;
        }
    }
}