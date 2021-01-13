const { Command } = require('../../');

module.exports = class extends Command
{
    constructor(...args)
    {
        super(...args, {
            name: 'sobre',
            aliases: [ 'about', 'personal-text' ],
            category: 'Misc',
            description: 'Edite sua frase personalizavel.',
            usage: '<frase>',
            examples: [
                'Olá! Eu sou o incrivel Wumpus!'
            ]
        });
    }

    async run({ channel, author }, args)
    {
        if (!args.length)
        {
            return channel.send(this.usageMessage());
        }

        const text = args.join(' ');
        if (text.length < 2 || text.length > 100)
        {
            return channel.send(`Sua frase deve conter entre **2** e **100** caracteres.`);
        }

        await this.client.database.users.update(author.id, {
            personalText: text
        });

        channel.send(`Sua frase foi **definida como**: ${text}`);
    }
}