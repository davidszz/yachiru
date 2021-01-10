const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Command, Constants, DragonsData, CanvasTemplates, DragonUtils, MiscUtils } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'dragons',
            aliases: [ 'dragões', 'dgs', 'dragão', 'dragon' ],
            category: 'RPG',
            description: 'Vizualize todos seus dragões.',
            usage: '[id]',
            examples: [
                '5'
            ],
            parameters: [
                {
                    type: 'string',
                    validate: (val) => /^\d+$/.test(val),
                    errors: {
                        validate: `Forneça um **id** válido contendo somente números.`
                    }
                }
            ]
        });
    }

    async run(message, [ id ])
    {
        const { channel, author } = message;

        const userdata = await this.client.database.users.findOne(author.id, 'dragons');
        const dragons = userdata.dragons;

        if (!dragons.length)
        {
            return channel.send('Você não possui nenhum **dragão** até o momento.');
        }

        if (id != null)
        {
            // const canvasPath = '../../utils/CanvasTemplates';
            // delete require.cache[require.resolve(canvasPath)];
            // const CanvasTemplates = require(canvasPath);

            id = parseInt(id);
            let dragon = dragons[id - 1];
            if (!dragon)
            {
                return channel.send(`Nenhum dragão com o id **${id}** foi encontrado.`);
            }   

            channel.startTyping()
                .catch(e => e);

            const dragonInfos = DragonsData[dragon.id];
            const elements = dragonInfos.elements.map(el => `src/assets/images/${el}-element.png`);
            const level = dragon.level || 1;

            const infos = {
                name: dragonInfos.name,
                nickname: dragon.nickname || null,
                elements,
                attack: DragonUtils.attackLevel(level, dragonInfos.baseAttack),
                defense: DragonUtils.defenseLevel(level, dragonInfos.baseDefense),
                health: DragonUtils.healthLevel(level, dragonInfos.baseHealth),
                gold: DragonUtils.goldMinute(level, dragonInfos.baseGold),
                food: DragonUtils.nextFood(level),
                level,
                dragonImage: dragonInfos.icons[(Object.keys(dragonInfos.icons).reduce((p, n) => Number(n) > Number(p) && Number(n) <= level ? n : p).toString())]
            };

            const buffer = await CanvasTemplates.dragonInfos(infos);
            const attachment = new MessageAttachment(buffer, 'dragon-infos.png');

            await message.yachiruReply(attachment);
            channel.stopTyping(true);
        }
        else 
        {
            const embed = new MessageEmbed()
                .setColor('#0084FF')
                .setAuthor(`Seus dragões (${dragons.length})`, author.avatarIcon())
                .setFooter(author.tag, author.avatarIcon())
                .addField('Informação:', `Use \`${this.fullname} ${this.usage}\` para ver informações detalhadas sobre um dragão.`)
                .setTimestamp();

            let totalGold = 0;
            for (let i = 0; i < dragons.length; i++)
            {
                let dragon = dragons[i];
                let dragonInfos = DragonsData[dragon.id.padStart(4, '0')];

                let nickname = dragon.nickname;
                let level = dragon.level || 0;
                let elements = dragonInfos.elements.map(el => Constants.emojis[`${el}_element`] || el);

                let hasGold = '';
                if (dragon.lastCollectedGold && ((Date.now() - dragon.lastCollectedGold) / 60000) >= 1)
                {
                    let gold = DragonUtils.getTotalGold(dragon.lastCollectedGold, dragonInfos.baseGold, level);
                    hasGold = ` **<:golden_bar:797222014754488350> ${MiscUtils.formatCurrency(gold)}**`;

                    totalGold += gold;
                }

                embed.setDescription([
                    embed.description || '',
                    `\`${`${i + 1}`.padStart(2, ' ')}\` **${nickname || dragonInfos.name}** ${elements.join('')} (lvl. ${level || 1})${hasGold}`
                ]);
            }

            embed.setDescription([
                embed.description || '',
                '',
                `<:golden_bar:797222014754488350> **Ouro total:** ${MiscUtils.formatCurrency(totalGold)}`
            ]);

            message.yachiruReply(embed);
        }
    }
}