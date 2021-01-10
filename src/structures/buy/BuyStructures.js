const { CommandError, StructuresData, ItemsData } = require('../../');

module.exports = class BuyStructures
{
    constructor(client)
    {
        this.client = client;
    }

    async handle({ author, item, amount, cost }, { incubator, structures })
    {
        if (item.hatcheryId)
        {
            if (incubator.id == item.hatcheryId)
            {
                throw new CommandError('Você já possui essa incubadora.');
            }
            
            if (incubator.id)
            {
                const level = Number(incubator.id);
                if (level > Number(item.hatcheryId))
                {
                    throw new CommandError('Você já possui uma incubadora melhor que esta.');
                }
            }

            if (amount > 1)
            {
                throw new CommandError('Você só pode comprar **uma** incubadora.');
            }

            await this.client.database.users.update(author.id, {
                $inc: {
                    money: -(cost)
                },
                "incubator.id": item.hatcheryId
            });
        }
        else if (item.templeId)
        {   
            if (amount > 1)
            {
                throw new CommandError('Você só pode comprar **1** templo de cada.');
            }

            if (structures[item.id])
            {
                throw new CommandError('Você já possui esse **templo**.');
            }

            const structureNum = Number(item.id);
            const haveNum = Object.keys(structures)
                .filter(x => ItemsData.structures.find(s => s.id == x && s.templeId != null))
                .reduce((p, n) => Number(n) > Number(p) ? Number(n) : Number(p), 0);

            if (haveNum && structureNum > (haveNum + 1))
            {
                const needTemples = ItemsData.structures
                    .filter(x => x.templeId && Number(x.id) < structureNum && !structures[x.id]);

                throw new CommandError(`Você precisa obter os templos: \`${Object.values(needTemples).map(x => x.name).join('`, `')}\` antes de comprar este.`);
            }

            await this.client.database.users.update(author.id, {
                $inc: {
                    money: -(cost)
                },
                [`structures.${item.id}`]: {
                    amount: 1,
                    templeId: item.templeId
                }
            });
        }
    }
}