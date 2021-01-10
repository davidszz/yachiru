const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Command, DragonUtils, DragonsData, Constants, ArenaUtils, MiscUtils } = require('../../');

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
        const userdata = await this.client.database.users.findOne(author.id, 'arena equippedDragon dragons');
        const arena = userdata.arena;

        const attachment = new MessageAttachment('src/assets/images/arena-1.png', 'stadium.png');

        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setAuthor(author.tag, author.avatarIcon())
            .attachFiles(attachment)
            .setDescription(`Para batalhar use \`${this.prefix}batalhar\``)
            .setThumbnail('attachment://stadium.png')
            .setTitle(`Arena Level ${arena.level}`)
            .setFooter(guild.name, guild.iconUri())
            .setTimestamp();

        let ndData = arena.nextDrag;
        let ndInfos = DragonsData[ndData.id];

        const dragInfos = (data, infos) => {
            let attack = DragonUtils.attackLevel(data.level, infos.baseAttack);
            let defense = DragonUtils.defenseLevel(data.level, infos.baseDefense);
            let health = DragonUtils.healthLevel(data.level, infos.baseHealth);
            let elements = infos.elements.map(x => Constants.emojis[`${x}_element`]);

            const pEnd = (str) => str.padEnd(11, ' ');
            const pStart = (str) => str.toString().padStart(5, ' ');

            let desc = [
                `${data.nickname || infos.name} (lvl. ${data.level})`,
                `Elementos: ${elements.join('')}`,
                '`' + pEnd('Vida:') + pStart(health) + '`',
                '`' + pEnd('Escudo:') + pStart(defense) + '`',
                '`' + pEnd('Ataque') + pStart(attack) + '`'
            ];

            return desc;
        };

        let prize = [
            `**Dinheiro:** ${MiscUtils.formatCurrency(ArenaUtils.goldPrize(arena.level || 1, arena.wins || 0))}`,
            `**XP:** ${MiscUtils.formatNumber(ArenaUtils.xpPrize(arena.level || 1, arena.wins || 0))}`
        ];

        if (ArenaUtils.nextBattleNum((arena.wins || 0) + 1) == 0)
        {
            prize.push(`**Nova arena:** Arena Nivel ${arena.level + 1}`);
        }

        let userdrag = userdata.equippedDragon != null ? userdata.dragons[userdata.equippedDragon] : null;
        let userdragInfos = userdrag ? DragonsData[userdrag.id] : null;

        if (userdragInfos)
        {
            embed.addField('Seu dragão:', dragInfos(userdrag, userdragInfos), true);
        }
        else 
        {
            embed.addField('Equipe seu dragão!', `Nenhum dragão equipado.\nUse \`${this.prefix}equipar <id>\` para equipar um dragão.`, true);
        }

        embed.addField(`Próximo desafio: ${ArenaUtils.nextBattleNum((arena.wins || 0) + 1)}/10`, dragInfos(ndData, ndInfos), true);
        embed.addField('Recompensa:', prize)
        embed.addField('Suas informações:', [
            `Batalhas totais: \`${arena.battles}\``,
            `Vitórias: \`${arena.wins}\``,
            `Derrotas: \`${arena.battles - arena.wins}\``
        ]);

        channel.send(embed);
    }
}