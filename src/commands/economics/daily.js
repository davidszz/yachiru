const { Command, MiscUtils, XPUtils } = require('../../');

const day = 86400000;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'daily',
            aliases: [ 'diária', 'diaria' ],
            category: 'Economia',
            description: 'Resgate sua recompensa diária por usar o bot',
            new: true
        });
    }

    async run(message)
    {
        const author = message.author;
        const userdata = await this.client.database.users.findOne(author.id, 'xp level lastDaily');

        if (userdata.lastDaily)
        {
            const time = Date.now() - userdata.lastDaily;
            if (time < day)
            {
                const remaining = day - time;
                return message.reply(`você precisa esperar \`${MiscUtils.shortDuration(remaining, 2)}\` antes de resgatar outra recompensa diária.`);
            }
        }

        const randValue = (min, max) => parseInt(min + Math.random() * (max - min));

        const money = randValue(1000, 10000);
        const xp = randValue(50, (userdata.level > 1 ? userdata.level / 2 : 1) * 100);
        const xpJson = XPUtils.updateXpJson(xp + userdata.xp, userdata.level);
       
        await this.client.database.users.update(author.id, {
            $inc: {
                money
            },
            lastDaily: Date.now(),
            ...xpJson
        });

        const formated = {
            money: MiscUtils.formatCurrency(money),
            xp: MiscUtils.formatNumber(xp, '.')
        };

        if (xpJson.level)
        {
            return message.reply(`você resgatou sua recompensa diário e recebeu **${formated.money}**, **${formated.xp} XP** e upou para o nível **${xpJson.level}**!`);
        }

        message.reply(`você resgatou sua recompensa diário e recebeu **${formated.money}** e **${formated.xp} XP**!`);
    }
}