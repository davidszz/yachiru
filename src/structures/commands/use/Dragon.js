const { CommandError } = require("../../..");

module.exports = class Dragon 
{
    constructor(client)
    {
        this.client = client;
    }

    async handle({ author, channel, item, dragons, hatchery, inventory })
    {
        var alreadyHave = 0;

        if (hatchery.id && hatchery.eggs && hatchery.eggs.length)
        {
            for (let egg of hatchery.eggs)
            {
                if (egg.id == item.id)
                {
                    alreadyHave++;
                }
            }
        }

        if (dragons.length)
        {
            for (let dragon of dragons)
            {
                if (dragon.id == item.id)
                {
                    alreadyHave++;
                }
            }
        }

        const dragon = this.client.dragons.get(item.id);
        if (dragon.limit)
        {
            if (alreadyHave >= dragon.limit)
            {
                throw new CommandError(`Você só pode ter **${dragon.limit}** ${dragon.name}.`);
            }
        }

        if (!hatchery.id)
        {
            throw new CommandError(`Você não possui nenhuma **incubadora**.`);
        }

        const { eggsLimit } = this.client.items.get(hatchery.id);
        if (hatchery.eggs)
        {
            if (hatchery.eggs.length)
            {
                if (hatchery.eggs.length >= eggsLimit)
                {
                    throw new CommandError(`Sua incubadora está **cheia**.`);
                }
            }
        }

        const update = {
            $addToSet: {
                'hatchery.eggs': {
                    id: item.id,
                    hatchAt: Date.now() + (dragon.hatchingTime * 1000)
                }
            }
        };

        if (inventory[item.id].amount <= 1)
        {
            update['$unset'] = {
                [`inventory.${item.id}`]: ''
            };
        }
        else 
        {
            update['$inc'] = {
                [`inventory.${item.id}.amount`]: -1
            }
        }

        await this.client.database.users.update(author.id, update);
        channel.send(`Você colocou um(a) **${dragon.name}** na sua incubadora.`);
    }
}