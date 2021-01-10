const { Command, ItemsData, MiscUtils, HatcherysData, EggsData } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'use',
            aliases: [ 'usar' ],
            category: 'RPG',
            description: 'Usa um item do seu inventário.',
            usage: '<item>',
            examples: [
                'ovo de dragão de fogo'
            ],
            parameters: [
                {
                    type: 'string',
                    required: true
                }
            ]
        });
    }

    async run({ channel, author }, [ name, ...args ])
    {
        name = name + ' ' + args.join(' ');
        const userdata = await this.client.database.users.findOne(author.id, 'inventory incubator');

        const allItems = Object.values(ItemsData).flat();
        const item = allItems.find(i => MiscUtils.sameString(i.name, name));

        if (!item)
        {
            return channel.send('Nenhum **item** foi encontrado.');
        }
        
        if (!userdata.inventory[item.id])
        {
            return channel.send('Você **não possui** nenhuma unidade deste item.');
        }

        const itemCategory = Object.keys(ItemsData).find(key => ItemsData[key].findIndex(i => i.id == item.id) > -1);
        
        if (itemCategory == 'eggs')
        {
            let incubator = HatcherysData[userdata.incubator.id || '0001'];
            let userEggs = userdata.incubator.eggs || [];

            if (userEggs.length >= incubator.slots)
            {
                return channel.send(`Você só pode chocar **${incubator.slots}** ovo${incubator.slots > 1 ? 's' : ''} por vez na sua incubadora.`);
            }
            
            let eggsInfo = EggsData[item.eggId];
            userEggs.push({
                id: item.eggId,
                endsAt: Date.now() + (eggsInfo.hatchingTime * 1000)
            });

            let updateObject = {
                'incubator.eggs': userEggs
            };

            if (userdata.inventory[item.id].amount > 1)
            {
                updateObject['$inc'] = {
                    [`inventory.${item.id}.amount`]: -1
                }
            }
            else 
            {
                updateObject['$unset'] = {
                    [`inventory.${item.id}`]: ''
                }
            }

            await this.client.database.users.update(author.id, updateObject);
            channel.send(`Você colocou um(a) **${item.name}** para chocar.`);
        }
        else 
        {
            channel.send('Este item não pode ser usado desta forma.');
        }
    }
}