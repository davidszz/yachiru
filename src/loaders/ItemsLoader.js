const { Loader, ItemsData, ItemManager, DragonsManager, DragonsData } = require('../');

module.exports = class ItemsLoader extends Loader 
{
    constructor(client)
    {
        super({
            preLoad: true
        }, client);
    }

    async load()
    {
        try 
        {
            const items = new ItemManager(this.client, ItemsData);
            this.client.items = items;
            
            const dragons = new DragonsManager(this.client, DragonsData);
            this.client.dragons = dragons;
            
            return true;
        }
        catch(err)
        {
            this.logError(err);
        }

        return false;
    }
}