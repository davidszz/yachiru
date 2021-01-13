const { MessageAttachment } = require('discord.js');
const { Command, DragonUtils, DragonsData, Constants, ArenaUtils, MiscUtils, YachiruEmbed } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'arena',
            category: 'RPG',
            description: 'Obtem informações sobre sua arena.'
        });
    }

    async run({ channel, author, guild })
    {
        const userdata = await this.client.database.users.findOne(author.id, 'arena level');
        if (userdata.level < 5)
        {
            return channel.send(`Você precisa estar nivel **5** ou superior para vizualizar sua arena.`);
        }
        const arena = userdata.arena;

        const attachment = new MessageAttachment('src/assets/images/arena-1.png', 'stadium.png');

        const embed = new YachiruEmbed()
            .setAuthor(author.tag, author.avatarIcon())
            .attachFiles(attachment)
            .setDescription(`Para batalhar use \`${this.prefix}batalhar\``)
            .setThumbnail('attachment://stadium.png')
            .setTitle(`Arena Level ${arena.level} (${(arena.wins % 10)}/10)`)
            .setFooter(guild.name, guild.iconUri())
            .setTimestamp();

        const nextDragon = arena.nextDrag;
        const ndInfos = DragonsData[nextDragon.id];

        const player = await this.client.players.get(author.id);
        const equipped = await player.dragons.equipped();

        const { battles = 0, wins = 0, level = 1 } = arena;
        const loses = battles - wins;

        const status = [
            `**Batalhas:** ${battles}`,
            `**Vitórias:** ${wins}`,
            `**Derrotas:** ${loses}`
        ];

        embed.setDescription(embed.description + '\n\n' + status.join(' | '))

        const xp = ArenaUtils.xpPrize(level, wins);
        const gold = ArenaUtils.goldPrize(level, wins);
        const nextLevel = ((wins + 1) % 10) == 0;

        const prize = [
            `**Dinheiro:** ${MiscUtils.formatCurrency(gold)}`,
            `**XP:** ${MiscUtils.formatNumber(xp, '.')}`,
        ];

        if (nextLevel)
        {
            prize.push(`> **NOVA ARENA NIVEL ${level + 1}**`);
        }

        embed.addField('Próx. Prêmio:', prize);

        let equippedInfos = `\`${this.prefix}equipar <id>\` para equipar um dragão.`;
        if (equipped)
        {
            let { infos, data } = equipped;
            let elements = infos.elements.map(x => Constants.emojis[`round_${x}`]);

            equippedInfos = [
                `**${infos.name} (lvl. ${data.level})**`,
                `Elementos: ${elements.join('')}`,
                `Vida: \`${infos.health}\``
            ];
        }

        embed.addField(`__${equipped.data && equipped.data.nickname || 'Seu dragão:'}__`, equippedInfos, true);
        embed.addField('__Desafio:__', [
            `**${ndInfos.name} (lvl. ${nextDragon.level})**`,
            `Elementos: ${ndInfos.elements.map(x => Constants.emojis[`round_${x}`]).join('')}`,
            `Vida: \`${DragonUtils.healthLevel(nextDragon.level, ndInfos.baseHealth)}\``
        ], true)

        channel.send(embed);
    }
}