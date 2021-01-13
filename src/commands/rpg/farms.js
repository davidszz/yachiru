const { Command, FarmsData, MiscUtils, Constants, YachiruEmbed } = require('../../');
const Emojis = Constants.emojis;

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
        const userdata = await this.client.database.users.findOne(author.id, 'farms');
        const farms = userdata.farms;

        if (!farms.length)
        {
            return channel.send('Você não possui **nenhuma** fazenda.');
        }

        var limit = 10;
        var pages = Math.ceil(farms.length / limit);
        var page = 1;

        const embedPage = (num) => {
            const embed = new YachiruEmbed()
                .setTitle(`Suas fazendas (${farms.length})`)
                .setDescription(`Para colher a plantação de alguma fazenda use \`${this.prefix}colher <id ou tudo>\`\n`)
                .setFooter(author.tag + `${pages > 1 ? ` • Página ${num}/${pages}` : ''}`, author.avatarIcon())
                .setTimestamp();

            const sliceFarms = farms.slice((num * limit) - limit, num * limit);
            for (const farm of sliceFarms)
            {
                let infos = FarmsData[farm.id];
                if (!infos) continue;

                let remaining = `${infos.production} 🍒`;
                if (farm.lastHarvest)
                {

                    let calc = Date.now() - farm.lastHarvest;
                    let cooldown = infos.cooldown * 1000;
                    
                    if (calc < cooldown)
                    {
                        const char = '█';
                        const progress = parseInt((calc / cooldown) * 10);

                        remaining = MiscUtils.shortDuration(cooldown - calc, 2);
                        // remaining += '`' + `[${char.repeat(progress)}${'.'.repeat(10 - progress)}]` + '`' + ` ${parseInt((calc / cooldown) * 100)}%`;
                    }
                }
                
                embed.setDescription([
                    embed.description || '',
                    `\`${`${farms.indexOf(farm) + 1}.`.padStart(3, ' ')}\` ${infos.emoji} **${infos.name}** \u00BB \`${remaining}\``
                ]);
            }

            page = num;
            return embed;
        };

        channel.send(embedPage(1))
            .then(async msg => {
                if (pages > 1)
                {
                    const reactions = [ Emojis.previous, Emojis.next ]
                        .map(x => Constants.parseEmoji(x));

                    for (const reaction of reactions) 
                    {
                        await msg.react(reaction).catch(e => e);
                    }

                    const filter = (r, u) => u.id === author.id && Object.values(r.emoji).some(x => reactions.includes(x));
                    const collector = msg.createReactionCollector(filter, { idle: 60000 });

                    collector.on('collect', async (r, u) => {
                        const emoji = reactions.includes(r.emoji.name)
                            ? r.emoji.name : r.emoji.id;

                        if (emoji == Constants.reaction('previous'))
                        {
                            let calc = page - 1;
                            if (calc >= 1)
                            {
                                await msg.edit(embedPage(calc))
                                    .catch(e => e);
                            }
                            else 
                            {
                                await msg.edit(embedPage(pages))
                                    .catch(e => e);
                            }
                        }
                        else 
                        {
                            let calc = page + 1;
                            if (calc <= pages)
                            {
                                await msg.edit(embedPage(calc))
                                    .catch(e => e);
                            }
                            else 
                            {
                                await msg.edit(embedPage(1))
                                    .catch(e => e);
                            }
                        }

                        r.users.remove(u)
                            .catch(e => e);
                    });
                }
            });
    }
}