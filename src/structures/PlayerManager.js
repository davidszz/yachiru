const Player = require('./Player');

const players = new Map();
const data = new Map();

class PlayerManager 
{
    constructor(client)
    {
        this.client = client;
    }

    get all()
    {
        return players;
    }

    get cache()
    {
        return data;
    }

    async get(id)
    {
        let player = players.get(id);
        if (player) return player;

        let user = this.client.users.cache.get(id)
            || await this.client.users.fetch(id).catch(() => null);
        
        if (!user) return null;
        else 
        {
            let player = new Player(this.client, user);
            players.set(id, player);
            return player;
        }
    }
}

module.exports = PlayerManager;