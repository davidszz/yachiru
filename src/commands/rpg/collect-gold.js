const { Command, DragonsData, MiscUtils, DragonUtils } = require('../..');

const isNum = (str) => !isNaN(str) && Number(str) > 0 && Number.isInteger(Number(str));

module.exports = class extends Command
{
    constructor(...args)
    {
        super(...args, {
            name: 'coletar',
            aliases: [ 'collect-gold', 'collect', 'coletar-ouro' ],
            category: 'RPG',
            description: 'Colete o ouro de seus dragões.',
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
            let updated = false;
            let toCollect = [];
            for (const idx in userdata.dragons)
            {   
                const dragon = userdata.dragons[idx];

                if (!dragon.lastCollectedGold)
                {
                    if (!updated) updated = true;
                    
                    dragon.lastCollectedGold = Date.now();
                    userdata.dragons[idx] = dragon;
                    
                    continue;
                }

                const totalTime = Date.now() - dragon.lastCollectedGold || Date.now();
                if (totalTime < 60000)
                {
                    continue;
                }   

                const dragonInfos = DragonsData[dragon.id];
                toCollect.push(DragonUtils.getTotalGold(dragon.lastCollectedGold, dragonInfos.baseGold, dragon.level || 1));

                dragon.lastCollectedGold = Date.now();
                userdata.dragons[idx] = dragon;
            }   

            if (updated)
            {
                await this.client.database.users.update(author.id, {
                    dragons: userdata.dragons
                });
            }

            if (!toCollect.length)
            {
                return channel.send('Nenhum de seus **dragões** possuem dinheiro a ser coletado.');
            }

            const collected = toCollect.reduce((p, n) => p + n);
            await this.client.database.users.update(author.id, {
                dragons: userdata.dragons,
                $inc: { money: collected }
            });

            return channel.send(`Você coletou **${MiscUtils.formatCurrency(collected)}** de **${toCollect.length}** dragões.`);
        }
            
        const dragon = userdata.dragons[Number(arg) - 1];
        if (!dragon)
        {
            return channel.send(`Nenhum dragão com o id **${arg}** foi encontrado.`);
        }

        const totalTime = Date.now() - dragon.lastCollectedGold;
        if (isNaN(totalTime))
        {
            dragon.lastCollectedGold = Date.now();
            userdata.dragons[Number(arg) - 1] = dragon;

            await this.client.database.users.update(author.id, {
                dragons: userdata.dragons
            });

            return channel.send(`Esse dragão não possui **dinheiro** para coletar.`);
        }

        if (totalTime < 60000)
        {
            return channel.send('Esse dragão não possui **dinheiro** para coletar.');
        }

        const dragonInfos = DragonsData[dragon.id];
        const collectTotal = DragonUtils.getTotalGold(dragon.lastCollectedGold, dragonInfos.baseGold, dragon.level || 1);

        dragon.lastCollectedGold = Date.now();
        userdata.dragons[Number(arg) - 1] = dragon;

        await this.client.database.users.update(author.id, {
            dragons: userdata.dragons,
            $inc: { money: collectTotal }
        });

        const nickname = dragon.nickname || dragonInfos.name;
        channel.send(`Você coletou **${MiscUtils.formatCurrency(collectTotal)}** do(a) seu dragão **${nickname} \`${arg}\`**.`);
    }
}