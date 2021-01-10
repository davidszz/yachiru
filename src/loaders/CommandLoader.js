const { Loader, Command, FileUtils } = require('../');

module.exports = class CommandLoader extends Loader 
{
    constructor(client) 
    {
        super({
            critical: true
        }, client);

        this.commands = [];
        this.aliases = [];
    }

    async load() 
    {
        try 
        {
            await this.initializeCommands();
            this.client.commands = this.commands;
            this.client.aliases = this.aliases;
            return true;
        } 
        catch(e) 
        {
            this.logError(e);
        }
        return false;
    }

    initializeCommands(dirPath = 'src/commands') 
    {
        let success = 0, failed;

        return FileUtils.requireDir(dirPath, (NewCommand, path) => {
            this.addCommand(new NewCommand(this.client, path.split('\\').pop().split('.')[0]), path) 
                ? success++ : failed++;
        }, this.logError.bind(this)).then(() => {
            if (failed) 
                this.log(`${success} commands loaded, ${failed} failed.`, { color: 'yellow', tags: ['Commands'] });
            else 
                this.log(`All ${success} commands loaded without errors.`, { color: 'green', tags: ['Commands'] });
        });
    }

    addCommand(command, path) 
    {
        if (!(command instanceof Command)) 
            return false;

        command.path = path;
        this.commands.push(command);

        if (command.aliases && command.aliases.length)
        {
            command.aliases.forEach(alias =>  this.aliases.push(alias));
        }

        return true;
    }
}