const { Command } = require('../..');
const path = require('path');
const CommandLoader = require('../../loaders/CommandLoader');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'command-reload',
            aliases: [ 'r-command', 'c-reload', 'reload' ],
            usage: '[comando]',
            category: 'Desenvolvedores',
            hidden: true,
            developer: true,
            parameters: [
                {
                    type: 'string',
                    returnsLower: true,
                    required: false
                }
            ]
        });
    }

    async run({ channel }, [ cmdName ])
    {
        if (!cmdName)
        {
            let loader = new CommandLoader(this.client);
            await loader.load();

            channel.send('Comandos **recarregados** com sucesso! Cheque o console para mais informações.');
            return;
        }

        const command = this.client.commands.find(
            c => c.name.toLowerCase() == cmdName || c.aliases.includes(cmdName) 
        );

        if (!command)
        {
            return channel.send(`Comando não encontrado.`);
        }

        try 
        {
            const completePath = path.dirname(require.main.filename) + '\\' + command.path;
            delete require.cache[require.resolve(completePath)];

            const NewCommand = require(completePath);
            const cmd = new NewCommand(this.client, command.name);
            cmd.path = command.path;

            this.client.commands.splice(
                this.client.commands.indexOf(command), 1
            );
            this.client.commands.push(cmd);
            
            channel.send(`O comando **${cmd.name}** foi recarregado com sucesso!`);
        }
        catch(err)
        {
            channel.send(`Um erro ocorreu ao recarregar este comando: \`\`\`${err.toString()}\`\`\``);
        }
    }
}