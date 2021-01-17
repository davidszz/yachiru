const { Command, MiscUtils, DragonUtils } = require('../..');

const isNum = (str) => !isNaN(str) && Number(str) > 0 && Number.isInteger(Number(str));

module.exports = class extends Command
{
    constructor(...args)
    {
        super(...args, {
            name: 'coletar',
            aliases: [ 'collect' ],
            category: 'RPG',
            description: 'Colete o dinheiro produzido por seus dragões.',
            usage: '<id ou tudo>',
            examples: [ '1', 'tudo' ],
            parameters: [
                {
                    type: 'string',
                    returnsLower: true,
                    required: true
                }
            ]
        });
    }

    async run({ channel, author }, [ arg ])
    {
        const words = [ 'tudo', 'td', 'all', 'tds' ];
        if (!isNum(arg) && !words.includes(arg))
        {
            return channel.send(this.usageMessage());
        }

        const userdata = await this.client.database.users.findOne(author.id, 'dragons');
        if (!userdata.dragons.length)
        {
            return channel.send('Você não possui nenhum **dragão**.');
        }

        if (words.includes(arg))
        {
            var collected = 0;
            var total = 0;

            for (const i in userdata.dragons)
            {
                const dragon = userdata.dragons[i];

                const gold = DragonUtils.totalGold(dragon);
                if (gold < 1) continue;

                total++;
                collected += gold;

                dragon.lastCollectedGold = Date.now();
                userdata.dragons[i] = dragon;
            }

            if (!total)
            {
                return channel.send(`Nenhum de seus dragões possuem dinheiro a ser coletado.`);
            }

            await this.client.database.users.update(author.id, {
                $inc: {
                    money: collected
                },
                dragons: userdata.dragons
            });

            return channel.send(`Você coletou **${MiscUtils.formatCurrency(collected)}** de **${total}** dragões!`);
        }

        const idx = Number(arg) - 1;
        const dragon = userdata.dragons[idx];
        
        if (!dragon)
        {
            return channel.send(`Nenhum dragão com esse **id** foi encontrado.`);
        }

        const gold = DragonUtils.totalGold(dragon);
        if (gold < 1)
        {
            return channel.send(`Esse dragão não possui **dinheiro** a ser coletado.`);
        }

        dragon.lastCollectedGold = Date.now();
        userdata.dragons[idx] = dragon;

        await this.client.database.users.update(author.id, {
            $inc: {
                money: gold
            },
            dragons: userdata.dragons
        });

        channel.send(`Você coletou **${MiscUtils.formatCurrency(gold)}** do seu dragão com o id **${arg}**!`);
    }
}