const { Command, DragonBattle, DragonUtils, YachiruEmbed, MiscUtils, DragonsData, ArenaUtils, XPUtils } = require('../../');

const battleCooldown = 60 * 60000;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'batalhar',
            aliases: [ 'battle', 'batalha' ],
            category: 'RPG',
            description: 'Inicie uma batalha da arena.'
        });
    }

    async run({ channel, author })
    {   
        const userdata = await this.client.database.users.findOne(author.id, 'arena equippedDragon dragons money xp level');
        const arena = userdata.arena;

        if (arena.lastBattle)
        {
            const time = Date.now() - arena.lastBattle;
            if (time < battleCooldown)
            {
                const remaining = battleCooldown - time;
                return channel.send(`Você deve esperar \`${MiscUtils.shortDuration(remaining, 2)}\` antes de batalhar novamente na arena.`);
            }
        }

        if (userdata.equippedDragon == null)
        {
            return channel.send(`Você não possui **nenhum** dragão **equipado**.`);
        }

        await this.client.database.users.update(author.id, {
            "arena.lastBattle": Date.now()
        });

        const player = await this.client.players.get(author.id);
        const equipped = await player.dragons.equipped();

        const target = {
            data: arena.nextDrag,
            infos: DragonsData[arena.nextDrag.id]
        };

        target.infos.health = DragonUtils.healthLevel(target.data.level, target.infos.baseHealth);
        target.infos.skills = DragonUtils.parseSkills(target.infos.skills, target.data.level);

        const context = { 
            client: this.client, 
            channel, 
            user: author 
        };

        const battle = new DragonBattle(context, equipped, target);
        const result = await battle.start()
            .catch(e => e);

        battle.message.del();

        const onLose = () => {
            return this.client.database.users.update(author.id, {
                $inc: {
                    "arena.battles": 1
                }
            });
        }

        if (typeof result === 'string')
        {
            if (result == 'message deleted')
            {
                await this.client.database.users.update(author.id, {
                    "arena.lastBattle": Date.now() - battleCooldown + 600000
                });

                return channel.send(`A mensagem da sua batalha foi deletada e sua batalha foi cancelada. Você deverá esperar **10** minutos para batalhar novamente.`);
            }

            if (result == 'idle')
            {
                await onLose();
                return channel.send(`${author}, você perdeu a batalha por ter ficado mais de **1 minuto** ausênte.`);
            }
        }
        else 
        {
            if (!('win' in result))
            {
                return channel.send(`${author}, ocorreu um erro durante sua batalha: \`\`\`${result}\`\`\``);
            }

            if (result.win)
            {
                const wonMoney = ArenaUtils.goldPrize(arena.level, arena.wins);
                const wonXp = ArenaUtils.xpPrize(arena.level, arena.wins);
                const nextArena = (arena.wins + 1) % 10 == 0;
                
                const prize = [
                    `**Dinheiro:** ${MiscUtils.formatCurrency(wonMoney)}`,
                    `**XP:** ${MiscUtils.formatNumber(wonXp, '.')}`
                ];

                if (nextArena)
                {
                    prize.push(`**NOVA ARENA NIVEL ${arena.level + 1}**`);
                }

                const winEmbed = new YachiruEmbed()
                    .setTitle(`Você ganhou a batalha 🎉🎊`)
                    .setDescription(`Parabéns ${author}!!! Você ganhou uma batalha na arena nivel **${arena.level}** contra um(a) **${target.infos.name} (lvl. ${target.data.level})**!`)
                    .addField('Premiação:', prize, true)
                    .setFooter(`${author.tag} possui ${arena.battles + 1} batalhas, ${arena.wins + 1} vitórias e ${arena.battles - arena.wins} derrotas.`, author.avatarIcon())
                    .setTimestamp();
                
                const nextDragLevel = (nextArena ? arena.level + 1 : arena.level) * 4 + arena.wins;
                const xpObj = XPUtils.updateXpJson(userdata.xp + wonXp, userdata.level);

                const updateObj = {
                    $inc: {
                        "arena.battles": 1,
                        "arena.wins": 1,
                        "money": wonMoney
                    },
                    "arena.nextDrag": {
                        id: Object.keys(DragonsData)[Math.floor(Math.random() * Object.keys(DragonsData).length)],
                        level: nextDragLevel
                    },
                    ...xpObj
                };

                await this.client.database.users.update(author.id, updateObj);

                if (nextArena)
                {
                    updateObj["arena.level"] = arena.level + 1;
                }

                channel.send(author, winEmbed);
            }
            else 
            {
                await onLose();
                
                const loseEmbed = new YachiruEmbed()
                    .setColor('#FF0000')
                    .setTitle(`Você perdeu a batalha`)
                    .setDescription(`${author} você perdeu uma batalha na arena nivel **${arena.level}** com seu dragão **${equipped.data.nickname || equipped.infos.name} (lvl. ${equipped.data.level})** para um(a) **${target.infos.name} (lvl. ${target.data.level})**!`)
                    .setFooter(`${author.tag} possui ${arena.battles + 1} batalhas, ${arena.wins} vitórias e ${(arena.battles + 1) - arena.wins} derrotas.`, author.avatarIcon())
                    .setTimestamp();

                channel.send(author, loseEmbed);
            }
        }
    }
}