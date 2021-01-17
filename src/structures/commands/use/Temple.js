const { CommandError, Command } = require("../../..");

module.exports = class Temple
{
    constructor(client)
    {
        this.client = client;
    }

    async handle({ channel, author, item, temples, xpJson, inventory })
    {
        if (temples.find(x => x.id == item.id))
        {
            throw new CommandError(`Você só pode ter **1** templo desse construido.`);
        }

        if (item.requireItems)
        {   
            for (let i of item.requireItems)
            {
                let has = temples.find(x => x.id == i);
                if (!has)
                {
                    const items = item.requireItems
                        .map(x => this.client.items.get(x).name);
    
                    throw new CommandError(`Você precisa ter: \`${items.join('`, `')}\` antes de construir esse templo.`);
                }
            }
        }

        var update = {
            $addToSet: {
                temples: {
                    id: item.id
                }
            }
        };

        if (inventory[item.id].amount > 1)
        {
            update['$inc'] = {
                [`inventory.${item.id}.amount`]: -1
            };
        }
        else 
        {
            update['$unset'] = {
                [`inventory.${item.id}`]: ''
            };
        }

        if (xpJson != null)
        {
            update = {
                ...update,
                ...xpJson
            }
        };

        const infos = this.client.items.get(item.id);
        const wonXp = infos.xp ? ` e ganhou **${infos.xp} XP**` : '';

        await this.client.database.users.update(author.id, update);
        channel.send(`Você construiu **${infos.name}**${wonXp}!`);
    }
}