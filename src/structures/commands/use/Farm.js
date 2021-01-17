const { CommandError } = require("../../..");

module.exports = class Farm 
{
    constructor(client)
    {
        this.client = client;
    }

    async handle({ author, channel, farms, inventory, item, xpJson })
    {
        var has = 0;
        for (let farm of farms)
        {
            if (farm.id == item.id)
                has++;
        }

        var infos = this.client.items.get(item.id);
        if (infos.max && has >= infos.max)
        {
            throw new CommandError('Você já possui o **máximo** de fazendas permitidas desse tipo.');
        }

        var update = {
            $addToSet: {
                farms: {
                    id: item.id,
                    lastHarvest: Date.now()
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

        const wonXp = item.xp ? ` e ganhou **${item.xp} XP**` : '';

        await this.client.database.users.update(author.id, update);
        channel.send(`Você construiu uma nova **${infos.name}**${wonXp}!`);
    }
}