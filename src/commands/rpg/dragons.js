const { Command, Constants, DragonsData, YachiruEmbed, DragonUtils, MiscUtils } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'dragões',
            aliases: [ 'dragons', 'drags' ],
            category: 'RPG',
            description: 'Vizualize todos seus dragões.'
        });
    }

    async run(message)
    {
        const { channel, author } = message;

        const userdata = await this.client.database.users.findOne(author.id, 'dragons');
        const dragons = userdata.dragons;

        if (!dragons.length)
        {
            return channel.send('Você não possui nenhum **dragão** até o momento.');
        }

        const embed = new YachiruEmbed()
            .setAuthor(`Seus dragões (${dragons.length})`, author.avatarIcon())
            .setFooter(author.tag, author.avatarIcon())
            .addField('Informação:', `Use \`${this.prefix}dragão <id>\` para ver informações detalhadas sobre um dragão.`)
            .setTimestamp();

        let totalGold = 0;
        for (let i = 0; i < dragons.length; i++)
        {
            let dragon = dragons[i];
            let dragonInfos = DragonsData[dragon.id.padStart(4, '0')];

            let nickname = dragon.nickname;
            let level = dragon.level || 0;
            let elements = dragonInfos.elements.map(el => Constants.emojis[`round_${el}`] || el);

            let hasGold = '';
            if (dragon.lastCollectedGold && ((Date.now() - dragon.lastCollectedGold) / 60000) >= 1)
            {
                let gold = DragonUtils.getTotalGold(dragon.lastCollectedGold, dragonInfos.baseGold, level);
                hasGold = ` **<:golden_bar:797222014754488350> ${MiscUtils.formatCurrency(gold)}**`;

                totalGold += gold;
            }

            embed.setDescription([
                embed.description || '',
                `\`${`${i + 1}`.padStart(dragons.length.toString().length, ' ')}\` **${nickname || dragonInfos.name}** ${elements.join('')} (lvl. ${level || 1})${hasGold}`
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