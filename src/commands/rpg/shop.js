const { Command, YachiruEmbed, Lang, MiscUtils, Constants } = require('../../');
const { alphaString, formatCurrency } = MiscUtils;

const Emojis = Constants.emojis;
const getReaction = Constants.reaction;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'loja',
            aliases: [ 'shop', 's' ],
            category: 'RPG',
            description: 'Abre a loja de itens do bot.',
            usage: '[categoria]',
            examples: [
                'fazendas'
            ],
            parameters: [
                {
                    type: 'string',
                    returnsLower: true
                }
            ]
        });
    }

    async run({ channel, author }, [ category ])
    {
        const self = this;
        const categories = this.client.items.categories;

        if (!category)
        {
            const embed = new YachiruEmbed(author);
            embed.setTitle('👜 Loja');

            for (const category in categories)
            {
                const itemsAmount = categories[category];
                embed.addDescription(`**${Lang.items.categories[category] || category}** (${itemsAmount})`);
            }

            embed.addDescription('');
            embed.addDescription(`\`${this.fullname} ${this.usage}\` para ver os items de uma categoria.`);

            return channel.send(author, embed);
        }

        category = alphaString(category);
        const langCategories = Object.values(Lang.items.categories)
            .map(x => alphaString(x).toLowerCase());

        const idx = langCategories.indexOf(category);
        if (idx === -1)
        {
            return channel.send(`Nenhuma categoria com esse nome foi encontrada.`);
        }

        category = Object.keys(Lang.items.categories)[idx];
        const items = this.client.items.getCategoryItems(category)
            .filter(x => x.avaliable == null || !!x.avaliable);

        const categoria = Lang.items.categories[category] || category;
        if (items.length < 1)
        {
            return channel.send(`A categoria **${categoria}** não possui items.`);
        } 

        var limit = 5;
        var pages = Math.ceil(items.length / limit);
        var page = 1;

        var msg = await channel.send(paginatedEmbed(1));
        if (pages <= 1) return;

        var emojis = [ Emojis.back, Emojis.previous, Emojis.next, Emojis.skip, Emojis.times ];
        emojis = emojis.map(x => Constants.parseEmoji(x));

        for (const emoji of emojis)
        {
            await msg.react(emoji)
                .catch(e => e);
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

        function paginatedEmbed(num)
        {
            page = num;
            
            const embed = new YachiruEmbed(author)
            embed.setAuthor(`👜 Loja: ${categoria}`);

            const calc = limit * num;
            for (let i = calc - limit; i < calc; i++)
            {
                const item = items[i];
                if (!item) continue;

                const { id, name, price, sell, level } = item;

                let itemDesc = `\`${id}\``;
                itemDesc += ` **${name}**`;

                if (level)
                {
                    itemDesc += ` - **Lvl. ${level}**`;
                }

                itemDesc += `\nPreço: \`${formatCurrency(price)}\``;

                if (sell)
                {
                    itemDesc += ` \u2022 Venda: \`${formatCurrency(sell)}\``;
                }
                
                embed.addDescription(itemDesc + '\n');
            }

            embed.addDescription(`**Página ${num} de ${pages}**\n`);
            embed.addDescription(`\`${self.prefix}comprar <id> [quantidade: 1]\` para comprar um item.`);

            return embed;
        }
    }
}