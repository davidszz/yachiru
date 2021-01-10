const { CommandError } = require('../../');

module.exports = class BuyFarms
{
    constructor(client)
    {
        this.client = client;
    }

    async handle({ author, item, amount, cost }, { farms })
    {
        if (item.farmId)
        {   
            const amountOfThis = farms.filter(x => x.id == item.farmId).length;
            const totalAmount = amountOfThis + amount;

            if (totalAmount > 5)
            {
                if (5 - amountOfThis)
                {
                    throw new CommandError(`Você só pode comprar mais **${5 - amountOfThis}** fazendas deste tipo.`);
                }
                
                if (amountOfThis >= 5)
                {
                    throw new CommandError(`Você já atingiu o limite de **cinco** fazendas deste tipo.`);
                }
            }

            let updateFarms = farms;
            for (let i = 0; i < amount; i++)
            {
                updateFarms.push({ id: item.farmId, lastHarvest: Date.now() });
            }

            await this.client.database.users.update(author.id, {
                farms: updateFarms,
                $inc: {
                    money: -(cost)
                }
            });
        }
        else 
        {
            throw new CommandError('Erro não especificado.')
        }
    }
}