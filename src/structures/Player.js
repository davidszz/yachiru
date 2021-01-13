const { Inventory, Dragons } = require('./player/index.js');

class Player
{
    constructor(client, user)
    {
        this.client = client;
        this.user = user;
        this.inventory = new Inventory(this);
        this.dragons = new Dragons(this);
    }

    async data(fields)
    {
        return this.client.database.users.findOne(this.user.id, fields);
    }
}

module.exports = Player;