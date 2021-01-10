const { Loader, EventListener, FileUtils, MiscUtils } = require('../');

module.exports = class ListenerLoader extends Loader 
{
    constructor(client)
    {
        super({
            preLoad: true,
            critical: true
        }, client);

        this.listeners = [];
    }

    async load() 
    {
        try 
        {
            await this.initializeListeners();
            this.client.listeners = this.listeners;
            return true;
        } 
        catch(e) 
        {
            this.logError(e);
        }
        return false;
    }

    initializeListeners(dirPath = 'src/listeners') 
    {
        let success = 0, failed = 0;

        return FileUtils.requireDir(dirPath, (NewListener) => {
            if (Object.getPrototypeOf(NewListener) !== EventListener) 
                return;
            this.addListener(new NewListener(this.client)) ? success++ : failed++;
        }, this.logError.bind(this)).then(() => {
            if (failed) 
                this.log(`${success} listeners loaded, ${failed} failed.`, { color: 'yellow', tags: ['Listeners'] });
            else 
                this.log(`All ${success} listeners loaded without errors.`, { color: 'green', tags: ['Listeners'] });
        });
    }
    
    addListener(listener) 
    {
        if (!(listener instanceof EventListener)) 
        {
            this.log(`${listener.name} failed to load - Not an EventListener`, { color: 'red', tags: ['Listeners'] });
            return false;
        }

        listener.events.forEach(event => {
            this.client.on(event, listener['on' + MiscUtils.capitalize(event)]);
        });

        this.listeners.push(listener);
        return true;
    }
}