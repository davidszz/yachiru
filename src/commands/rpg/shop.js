const { Command, ItemsData, Constants, MiscUtils, YachiruEmbed } = require('../../');
const Lang = require('../../lang/pt-BR.json');
const Emojis = Constants.emojis;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'loja',
            aliases: [ 'shop', 's' ],
            category: 'RPG',
            description: 'Abre a loja de items do bot.',
            usage: '[categoria]',
            examples: [
                'ovos de dragões'
            ]
        });
    }

    async run({ channel, author }, args)
    {
        const self = this;

        const allItems = Object.entries(ItemsData)
            .map(data => data[1])
            .flat();

        if (!allItems.length)
        {
            return channel.send(`Não há **nenhum** item na loja até o momento.`);
        }

        const userdata = await this.client.database.users.findOne(author.id, 'money');
        const formatCurrency = MiscUtils.formatCurrency;

        if (args.length)
        {
            const ctg = args.join(' ');

            const langWords = Object.values(Lang.itemsCategory);
            const langCursor = langWords.find(x => MiscUtils.sameString(x, ctg));

            let category = ctg.toLowerCase();
            if (langCursor)
            {
                category = Object.keys(Lang.itemsCategory)[langWords.indexOf(langCursor)];
            }

            if (!ItemsData[category])
            {
                return channel.send('Nenhuma categoria foi encontrada.');
            }
            
            return channel.send(embedCategory(category));
        }
        else
        {
            const embed = new YachiruEmbed()
                .setTitle('Categorias disponiveis:')
                .setDescription([
                    `${Emojis.fire_egg} Ovos de Dragões`,
                    `${Emojis.huge_farm} Fazendas`,
                    `${Emojis.structures} Estruturas`,
                    '',
                    `**Saldo:** ${formatCurrency(userdata.money)}`
                ])
                .addField('Informação:', `Para comprar algo da loja use \`${this.client.prefix}comprar <item> [quantidade: 1]\`.`)
                .setFooter(author.tag, author.avatarIcon());

            channel.send(embed)
                .then(async msg => {
                    let emojis = [ Emojis.fire_egg, Emojis.huge_farm, Emojis.structures, Emojis.previous ];
                    emojis = emojis.map(e => Constants.parseEmoji(e));

                    for (let emoji of emojis)
                        await msg.react(emoji).catch(e => e);

                    const filter = (r, u) => u.id === author.id && Object.values(r.emoji).some(x => emojis.includes(x));
                    const collector = msg.createReactionCollector(filter, { idle: 60000 });

                    let mainPage = true;
                    collector.on('collect', async (r, u) => {
                        const emoji = emojis.includes(r.emoji.id) ? r.emoji.id : r.emoji.name;

                        if (emoji == Constants.reaction('previous'))
                        {
                            if (!mainPage)
                            {
                                await msg.edit(embed)
                                .catch(e => e);

                                mainPage = true;
                            }
                        }
                        else
                        {
                            if (mainPage)
                            {
                                const editMsg = (category) => msg.edit(embedCategory(category)).catch(err => err);
                                mainPage = false;

                                switch(emoji)
                                {
                                    case Constants.reaction('fire_egg'):
                                        await editMsg('eggs');
                                    break;

                                    case Constants.reaction('huge_farm'):
                                        await editMsg('farms');
                                    break;
                                    
                                    case Constants.reaction('structures'):
                                        await editMsg('structures');
                                    break;
                                }
                            }
                        }
                        
                        r.users.remove(u)
                            .catch(e => e);
                    });
                });
        }

        function embedCategory(category)
        {
            let items = ItemsData[category];
            const embed = new YachiruEmbed()
                .setAuthor(`Categoria ${Lang.itemsCategory[category] || category}`)
                .addField('Informação:', `Para comprar algo da loja use \`${self.client.prefix}comprar <item> [quantidade: 1]\``)
                .setFooter(author.tag, author.avatarIcon());
            
            if (items.length)
            {
                let description = [];
                for (let item of items)
                {
                    description.push(`\`${item.name}\` - ${formatCurrency(item.price || 0)}${item.sell ? ` | **Venda:** ${formatCurrency(item.sell)}` : ''}`);
                }

                embed.setDescription([
                    embed.description || '',
                    ...description,
                    '',
                    `**Saldo:** ${MiscUtils.formatCurrency(userdata.money)}`
                ]);
            }
            else 
            {
                embed.setDescription(`Não há nenhum item nessa categoria até o momento.`);
            }

            return embed;
        }
    }
}