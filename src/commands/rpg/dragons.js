const { Command, Constants, YachiruEmbed, MiscUtils, DragonUtils } = require('../../');
const Emojis = Constants.emojis;
const { formatCurrency } = MiscUtils;

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

        const embed = new YachiruEmbed(author);
        embed.setTitle(`Seus Dragões (${dragons.length})`);

        var totalMoney = 0;
        for (const data of dragons)
        {
            const dragon = this.client.dragons.get(data.id);
            const elements = dragon.elements.map(x => Constants.emojis[`round_${x}`]).join('');
            const gold = DragonUtils.totalGold(data);

            const id = dragons.indexOf(data) + 1;

            let desc = '`' + id + '`';
            desc += ` **${dragon.name}**`;
            if (data.equipped)
            {
                desc += ' 🗡️';
            }

            desc += ' ' + elements;
            desc += ` (lvl. ${data.level})`;

            if (gold > 0)
                desc += ` ${Emojis.gold_bars} ${formatCurrency(gold)}`; 

            embed.addDescription(desc);

            totalMoney += gold;
        }

        embed.addDescription('');
        embed.addDescription(`${Emojis.gold_bars} **Total:** ${formatCurrency(totalMoney)}`);
        embed.addDescription('');
        embed.addDescription(`\`${this.prefix}dragão <id>\` para informações sobre um dragão.`);
        embed.addDescription(`\`${this.prefix}coletar <id ou tudo>\` para coletar o dinheiro de seus dragões.`);

        channel.send(embed);
    }   
}