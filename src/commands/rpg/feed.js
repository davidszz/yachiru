const { Command, DragonUtils, StructuresData, MiscUtils } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'feed',
            aliases: [ 'alimentar' ],
            category: 'RPG',
            description: 'Alimente um dragão.',
            usage: '<id>',
            examples: [
                '1'
            ],
            parameters: [
                {
                    type: 'string',
                    required: true,
                    validate: (val) => /^\d+$/.test(val) && Number(val) > 0,
                    errors: {
                        validate: 'Forneça um **id** válido acima de **0** contendo apenas números.'
                    }
                }
            ]
        });
    }

    async run({ channel, author }, [ id ])
    {
        const userdata = await this.client.database.users.findOne(author.id, 'dragonFood dragons structures level');

        if (!userdata.dragonFood)
        {
            return channel.send('Você não possui nenhuma **ração** para alimentar dragões.');
        }

        const dragonData = userdata.dragons[parseInt(id) - 1];
        if (!dragonData)
        {
            return channel.send(`Nenhum dragão com o id **${id}** foi encontrado.`);
        }

        if (dragonData.level >= 70)
        {
            return channel.send(`Este dragão já alcançou o nivel **máximo**.`);
        }

        const nextFood = DragonUtils.nextFood(dragonData.level || 1);
        const step = dragonData.foodStep || 1;
        const food = userdata.dragonFood;
        const formatedCost = MiscUtils.formatNumber(nextFood);
        
        if (dragonData.level && dragonData.level >= 10)
        {
            const templesData = Object.fromEntries(
                Object.entries(userdata.structures)
                    .filter(x => x[1].templeId != null)
            );

            const temples = Object.fromEntries(
                Object.entries(StructuresData)
                    .filter(x => x[1].type == 'temple' && Object.values(templesData).find(t => t.templeId == x[0]))
            );

            const maxLevel = Object.values(temples)
                .reduce((p, n) => n.reachLevel > p ? n.reachLevel : p, 0);

            if (dragonData.level >= maxLevel)
            {
                if (maxLevel < 40)
                {
                    return channel.send(`Você só pode **upar** seu dragão até o nivel **${maxLevel}**. Para aumentar o limite compre **templos** na loja.`);
                }

                if (maxLevel >= 40 && userdata.level < 100)
                {
                    return channel.send(`Para upar seu dragão acima do nivel **${maxLevel}** é necessário estar **level 100**.`);
                }   
            }
        }

        if (food < nextFood)
        {
            return channel.send(`Você não possui **🍒 ${formatedCost}** para alimentar esse dragão.`);
        }

        const updateObject = {};
        if (food - nextFood <= 0)
        {
            if (!updateObject['$unset']) updateObject['$unset'] = {};
            updateObject['$unset'][`dragonFood`] = '';
        }
        else 
        {
            if (!updateObject['$inc']) updateObject['$inc'] = {};
            updateObject['$inc'][`dragonFood`] = -nextFood;
        }

        if (step + 1 > 4)
        {
            dragonData.level = (dragonData.level || 1) + 1;
            dragonData.foodStep = 1;
        }
        else 
        {
            dragonData.foodStep = step + 1;
        }

        userdata.dragons[parseInt(id) - 1] = dragonData;
        updateObject['dragons'] = userdata.dragons;

        await this.client.database.users.update(author.id, updateObject);
        if (step + 1 > 4)
        {
            channel.send(`Você alimentou seu dragão com **🍒 ${formatedCost}** e ele passou para o nivel **${dragonData.level}**!`);
        }
        else 
        {
            channel.send(`Você alimentou seu dragão com **🍒 ${formatedCost}**. (${step}/4)`);
        }
    }
}