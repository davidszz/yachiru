const { Loader, PlayerManager } = require('..');

module.exports = class PlayerManagerLoader extends Loader 
{
    constructor(client)
    {
        super({
            preLoad: false
        }, client);

        this.players = null;
    }

    async load()
    {
        try 
        {
            await this.initializePlayers();
            this.client.players = this.players;
            return true;
        }
        catch(err)
        {
            this.logError(err);
        }

        return false;
    }

    async initializePlayers()
    {
        const playerManager = new PlayerManager(this.client);
        const users = this.client.users.cache.filter(u => !u.bot);

        for (const [ id ] of users)
        {
            await playerManager.get(id);
        }

        this.players = playerManager;
    }
}