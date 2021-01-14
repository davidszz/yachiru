const { Command, BadgesData, YachiruEmbed } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'badges',
            aliases: [ 'badge' ],
            category: 'Desenvolvedores',
            developer: true,
            hidden: true,
            usage: '[add ou remove] [usuário] [id]',
            examples: [
                'add @Wumpus staff',
                'remove @Wumpus 1'
            ],
            parameters: [
                {
                    type: 'string',
                    validate: (val) => [ 'add', 'remove' ].includes(val.toLowerCase()),
                    returnsLower: true,
                    errors: {
                        validate: 'Parâmetros disponíveis: `add`, `remove`'
                    }
                },
                {
                    type: 'user',
                    acceptSelf: true
                },
                {
                    type: 'string',
                    validate: (val) => !isNaN(val) && Number(val) > 0 && Number.isInteger(Number(val)),
                    errors: {
                        validate: 'Forneça um **id** válido acima de **0**.'
                    }
                }
            ]
        });
    }

    async run({ channel, author }, [ subCommand, user, badgeId ])
    {
        if (!subCommand)
        {
            const embed = new YachiruEmbed()
                .setAuthor(`Desenvolvedor(a) ${author.tag}`, author.avatarIcon())
                .setTitle('Lista de insigneas:')
                .setFooter(this.client.user.tag, this.client.user.avatarIcon())
                .setTimestamp();

            for (const id in BadgesData)
            {
                const badge = BadgesData[id];

                embed.setDescription([
                    embed.description || '',
                    `\`${id.padStart(2, '0')}\` ${this.client.emojis.cache.get(badge.emoji)} ${badge.name}`
                ]);
            }

            return channel.send(author, embed);
        }

        if (!user)
        {
            return channel.send(this.usageMessage());
        }

        if (!badgeId)
        {
            return channel.send(this.usageMessage());
        }

        const num = Number(badgeId);
        if (!BadgesData[num.toString()])
        {
            return channel.send(`Badge não encontrado.`);
        }

        const badge = BadgesData[num.toString()];
        if (subCommand === 'add')
        {
            await this.client.database.users.update(user.id, {
                $addToSet: {
                    badges: num.toString()
                }
            });

            channel.send(`Você adicionou a insignea **${badge.name}** para **${user.tag} (${user.id})**.`);
        }
        else 
        {
            await this.client.database.users.update(user.id, {
                $pull: {
                    badges: num.toString()
                }
            });
            
            channel.send(`Você removeu a insignea **${badge.name}** de **${user.tag} (${user.id})**.`);
        }
    }
}