const { Command, FarmsData, MiscUtils } = require('../../');
const XPUtils = require('../../utils/XPUtils');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'colher',
            aliases: [ 'harvest', 'colheita' ],
            description: 'Colha a plantação de suas fazendas.',
            category: 'RPG',
            usage: '<id ou tudo>',
            examples: [
                '1', 'tudo'
            ],
            parameters: [
                {
                    type: 'string',
                    validate: (val) => ['tudo', 'td', 'all', 'tds', 'todas'].includes(val.toLowerCase())
                        || (/^\d+$/.test(val) && parseInt(val) >= 1) ,
                    errors: {
                        validate: `Forneça um **id** válido para colher uma fazenda ou use \`tudo\` como parâmetro para colher todas.`
                    },
                    required: true
                }
            ]
        });
    }

    async run({ channel, author }, [ arg ])
    {
        const userdata = await this.client.database.users.findOne(author.id, 'farms xp level');
        const farms = userdata.farms;
        
        if (!farms.length)
        {
            return channel.send('Você não possui nenhuma fazenda.');
        }

        const isAvaliable = (farm, cooldown) => farm.lastHarvest 
            ? (Date.now() - farm.lastHarvest) >= (cooldown * 1000) 
            : true;

        if (Number(arg))
        {
            let num = Number(arg);
            let idx = num - 1;

            const farm = farms[idx];
            if (!farm)
            {
                return channel.send(`Nenhuma fazenda com o id **${num}** foi encontrada.`);
            }
            
            const infos = FarmsData[farm.id];
            if (!isAvaliable(farm, infos.cooldown))
            {
                const remaining = (infos.cooldown * 1000) - (Date.now() - farm.lastHarvest);
                return channel.send(`Faltam \`${MiscUtils.shortDuration(remaining, 2)}\` para colheita desta fazenda.`);
            }

            farm.lastHarvest = Date.now();
            farms[idx] = farm;

            let updates = {
                $inc: {
                    dragonFood: infos.production || 0
                },
                farms
            };

            if (infos.xp)
            {
                updates = {
                    ...updates,
                    ...(XPUtils.updateXpJson(userdata.xp + infos.xp, userdata.level))
                }
            }

            await this.client.database.users.update(author.id, updates);

            channel.send(`Você colheu sua **${infos.name}** com id \`${num}\` e ganhou **${MiscUtils.formatNumber(infos.production)} 🍒** e **${infos.xp} XP**.`);
        }
        else 
        {
            let food = 0;
            let xp = 0;
            let soon = 0;
            let collected = 0;

            for (let i = 0; i < farms.length; i++)
            {
                let farm = farms[i];
                let infos = FarmsData[farm.id];

                if (!isAvaliable(farm, infos.cooldown))
                {
                    let remaining = Date.now() - farm.lastHarvest;
                    if (!soon || soon > remaining)
                    {
                        soon = (infos.cooldown * 1000) - remaining;
                    }

                    continue;
                }
                
                farm.lastHarvest = Date.now();
                farms[i] = farm;

                food += infos.production;
                xp += infos.xp || 0;
                collected++;
            }

            if (!collected)
            {
                let remaning = MiscUtils.shortDuration(soon, 2);
                return channel.send(`**Nenhuma** fazenda pode ser colhida no momento. A fazenda mais próxima dará frutos em \`${remaning}\``);
            }

            let updates = {
                $inc: {
                    dragonFood: food
                },
                farms
            };

            if (xp)
            {
                updates = {
                    ...updates,
                    ...(XPUtils.updateXpJson(xp + userdata.xp, userdata.level))
                };
            }

            await this.client.database.users.update(author.id, updates);
            
            channel.send(`Você colheu **${collected}** fazenda${collected > 1 ? 's' : ''} e ganhou **${MiscUtils.formatNumber(food)} 🍒** e **${xp} XP**.`);
        }
    }
}