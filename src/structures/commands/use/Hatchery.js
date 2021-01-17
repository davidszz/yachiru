const { CommandError } = require('../../../');

module.exports = class Hatchery
{
    constructor(client)
    {
        this.client = client;
    }

    async handle({ author, channel, item, hatchery, inventory, xpJson })
    {
        if (hatchery.id == item.id)
        {
            throw new CommandError('Você já possui essa incubadora.');
        }

        const hatcherys = this.client.items.findByType('hatchery');

        const itemIndex = hatcherys.findIndex(x => x.id == item.id);
        const hasIndex = hatcherys.findIndex(x => x.id == hatchery.id);

        if (itemIndex > (hasIndex + 1))
        {
            const needs = hatcherys.slice(hasIndex + 1, itemIndex);
            throw new CommandError(`Você precisa das incubadoras: \`${needs.map(x => x.name).join('`, `')}\` antes de construir essa incubadora.`);
        }

        if (hasIndex > itemIndex)
        {
            throw new CommandError(`Você já possui uma incubadora melhor que essa.`);
        }

        hatchery.id = item.id;

        var update = {
            hatchery
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

        await this.client.database.users.update(author.id, update);
        channel.send(`${author}, você construiu uma **${item.name}**!`);
    }
}