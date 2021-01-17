const { Command, DragonBattle, DragonUtils, YachiruEmbed, ArenaUtils, MiscUtils, XPUtils, DragonsData } = require('../../');

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

    async run(message)
    {   
        const { channel, author } = message;

        const userdata = await this.client.database.users.findOne(author.id, 'arena dragons money xp level');
        const arena = userdata.arena;

        // if (arena.lastBattle)
        // {
        //     const time = Date.now() - arena.lastBattle;
        //     if (time < battleCooldown)
        //     {
        //         const remaining = battleCooldown - time;
        //         return channel.send(`Você deve esperar \`${MiscUtils.shortDuration(remaining, 2)}\` antes de batalhar novamente na arena.`);
        //     }
        // }

        const equipped = userdata.dragons.find(x => x.equipped);
        if (!equipped)
        {
            return message.reply(`você não possui **nenhum** dragão **equipado**.`);
        }

        await this.client.database.users.update(author.id, {
            "arena.lastBattle": Date.now()
        });

        const dragon = {
            ...(equipped),
            ...(this.client.dragons.get(equipped.id))
        };
        
        dragon.health = DragonUtils.healthLevel(dragon.level, dragon.baseHealth);
        dragon.startHealth = dragon.health;
        dragon.skills = DragonUtils.parseSkills(dragon.skills, dragon.level);

        const target = {
            ...(arena.nextDrag),
            ...(this.client.dragons.get(arena.nextDrag.id))
        };

        target.health = DragonUtils.healthLevel(target.level, target.baseHealth);
        target.startHealth = target.health;
        target.skills = DragonUtils.parseSkills(target.skills, target.level);

        const context = { 
            client: this.client, 
            channel, 
            user: author 
        };

        const battle = new DragonBattle(context, dragon, target);
        const result = await battle.start().catch(e => e);

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

                return channel.send(`${author}, a mensagem da sua batalha foi deletada e sua batalha foi cancelada. Você deverá esperar **10** minutos para batalhar novamente.`);
            }

            if (result == 'idle')
            {
                await onLose();
                return channel.send(`${author}, você perdeu a batalha por ter ficado mais de **1 minuto** ausênte.`);
            }
        }
        else 
        {
            if (!('won' in result))
            {
                return channel.send(`${author}, ocorreu um erro durante sua batalha: \`\`\`${result}\`\`\``);
            }

            if (result.won)
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
                    .setDescription(`Parabéns ${author}!!! Você ganhou uma batalha na arena nivel **${arena.level}** contra um(a) **${target.name} (lvl. ${target.level})**!`)
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
                    .setDescription(`${author} você perdeu uma batalha na arena nivel **${arena.level}** com seu dragão **${dragon.name} (lvl. ${dragon.level})** para um(a) **${target.name} (lvl. ${target.level})**!`)
                    .setFooter(`${author.tag} possui ${arena.battles + 1} batalhas, ${arena.wins} vitórias e ${(arena.battles + 1) - arena.wins} derrotas.`, author.avatarIcon())
                    .setTimestamp();

                channel.send(author, loseEmbed);
            }
        }
    }
}