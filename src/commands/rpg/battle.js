const { MessageEmbed } = require('discord.js');
const { Command, MiscUtils, DragonBattle, DragonsData, ArenaUtils, XPUtils } = require('../../');

const battleCooldown = 60 * 60000;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'battle',
            aliases: [ 'batalhar', 'batalha' ],
            category: 'RPG',
            description: 'Inicie uma batalha da arena.'
        });
    }

    async run({ channel, author })
    {
        const self = this;

        const fields = 'dragons equippedDragon arena xp level';
        const userdata = await this.client.database.users.findOne(author.id, fields);
        
        const arena = userdata.arena;
        const dragons = userdata.dragons;

        const level = arena.level || 1;
        const wins = arena.wins || 0;

        // if (arena.lastBattle)
        // {
        //     let remaining = Date.now() - arena.lastBattle;
        //     if (remaining <= battleCooldown)
        //     {
        //         let formated = MiscUtils.shortDuration(battleCooldown - remaining, 2);
        //         return channel.send(`Você precisa esperar \`${formated}\` antes de iniciar outra batalha.`);
        //     }
        // }

        const equipped = dragons[userdata.equippedDragon];
        if (userdata.equippedDragon == null || userdata.equippedDragon == -1 || !equipped)
        {
            return channel.send(`Você não possui nenhum **dragão** equipado.`);
        }

        if (!equipped.level || equipped.level < 4)
        {
            return channel.send(`É preciso um dragão de **nivel 4** no minímo para batalhar na arena.`);
        }

        equipped.owner = author.id;
        
        const context = {
            client: this.client,
            channel,
            user: author
        };  

        await this.client.database.users.update(author.id, {
            'arena.lastBattle': Date.now()
        });

        const battle = new DragonBattle(context, equipped, arena.nextDrag);
        battle.start()
            .then(endEvent)
            .catch(async (res) => {
                const embed = new MessageEmbed()
                    .setTitle('Batalha da arena cancelada')
                    .setDescription('Sua batalha atual da arena foi cancelada pelo motivo: **mensagem da batalha apagada durando o progresso**')
                    .setFooter(`Arena Nivel ${level} - Batalha ${ArenaUtils.nextBattleNum(wins + 1)}/10`, author.avatarIcon())
                    .setTimestamp();

                await this.client.database.users.update(author.id, {
                    $unset: {
                        'arena.lastBattle': ''
                    }
                });
                channel.send(author, embed.setColor('#FF0000'));
            });

        async function endEvent(won = false)
        {   
            const dragon = DragonsData[equipped.id];
            const nickname = equipped.nickname ? ` (${equipped.nickname})` : '';

            const opponent = DragonsData[arena.nextDrag.id];
            const opponentLevel = arena.nextDrag.level || 1;

            if (!won)
            {
                const embed = new MessageEmbed()
                    .setAuthor(author.tag, author.avatarIcon())
                    .setTitle('Derrota na arena')
                    .setDescription(
                        `Seu **${dragon.name} lvl ${equipped.level}${nickname}** perdeu uma batalha contra um(a) **${opponent.name} lvl ${opponentLevel}** da **arena nivel ${level}**.`
                    )
                    .setFooter(`Batalhas: ${(arena.battles || 0) + 1} | Vitórias: ${wins} | Derrotas: ${(arena.battles || 0) - (wins - 1)}`, self.client.user.avatarIcon())
                    .setTimestamp();

                await self.client.database.users.update(author.id, {
                    $inc: {
                        'arena.battles': 1
                    }
                });

                return channel.send(author, embed.setColor('#FF0000'));
            }

            const prizes = {
                money: ArenaUtils.goldPrize(level, wins),
                xp: ArenaUtils.xpPrize(level, wins)
            };

            const ids = Object.keys(DragonsData);
            const nextLevel = (arena.nextDrag.level || 1) + (arena.level || 1);
            const nextDragon = {
                id: ids[Math.floor(Math.random() * ids.length)],
                level: nextLevel >= 70 ? 70 : nextLevel
            };

            const update = {
                $inc: {
                    'arena.battles': 1,
                    'arena.wins': 1,
                    ...prizes
                },
                'arena.nextDrag': nextDragon
            };

            if ((userdata.xp + prizes.xp) >= XPUtils.needsXp(userdata.level))
            {
                let remainingXp = (userdata.xp + prizes.xp) - XPUtils.needsXp(userdata.level) || 0;

                update.$inc.xp = remainingXp;
                update.$inc.level = 1;
            }

            if ((wins + 1) % 10 == 0)
            {
                update.$inc['arena.level'] = 1;
            }

            const prizeInfos = [
                `**Dinheiro:** ${MiscUtils.formatCurrency(prizes.money)}`,
                `**XP:** ${MiscUtils.formatNumber(prizes.xp)}`
            ];

            if ((wins + 1) % 10 == 0)
            {
                prizeInfos.push(`**NOVA ARENA NIVEL ${arena.level + 1} ALCANÇADA!**`);
            }

            const embed = new MessageEmbed()
                .setColor('#00FF00')
                .setAuthor(author.tag, author.avatarIcon())
                .setTitle(`Vitória na arena!`)
                .setDescription(
                    `Seu **${dragon.name} lvl ${equipped.level}${nickname}** venceu a sua **${(wins % 10) + 1}°** batalha na **Arena Nivel ${arena.level}**!`
                )
                .addField('Prêmiação recebida:', prizeInfos)
                .setFooter(`Batalha contra ${opponent.name} lvl ${opponentLevel}`, self.client.user.avatarIcon())
                .setTimestamp();

            await self.client.database.users.update(author.id, update);
            channel.send(author, embed);
        }
    }
}