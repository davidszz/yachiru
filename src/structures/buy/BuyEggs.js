module.exports = class BuyEggs
{
    constructor(client)
    {
        this.client = client;
    }

    async handle({ author, item, amount, cost })
    {
        await this.client.database.users.update(author.id, {
            $inc: {
                [`inventory.${item.id}.amount`]: amount,
                money: -(cost)
            }
        });
    }
}