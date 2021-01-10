const { EventListener, XPUtils, MiscUtils } = require('../');

module.exports = class XPListener extends EventListener
{
    constructor(client)
    {
        super({
            events: [ 'message' ]
        }, client);
    }

    async onMessage(message)
    {
        if (message.author.bot || message.channel.type !== 'text')
            return;

        const { channel, author } = message;
        
        const data = await this.database.users.findOne(author.id, 'lastMessage');
        const calc = Date.now() - data.lastMessage;
        
        if (calc < 30000)
        {
            return;
        }

        await this.database.users.update(author.id, {
            lastMessage: Date.now()
        });

        const wonXp = parseInt(20 + Math.random() * 15);
        const result = await XPUtils.addXp(this, message.author.id, wonXp);

        if (result.old.level < result.new.level)
        {
            const earnedMoney = XPUtils.levelMoneyReward(result.new.level);
            await this.database.users.update(author.id, {
                $inc: {
                    money: earnedMoney
                }
            });

            channel.send(`Parabéns ${author.toString()}, você avançou para o level **${result.new.level}** e recebeu **${MiscUtils.formatCurrency(earnedMoney)}**!`);
        }
    }
}