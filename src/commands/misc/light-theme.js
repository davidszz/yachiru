const { Command } = require('../../');

module.exports = class extends Command
{
    constructor(...args)
    {
        super(...args, {
            name: 'tema-claro',
            aliases: [ 'temaclaro', 'light-theme', 'lighttheme' ],
            category: 'Misc',
            description: 'Altere entre o tema claro e escuro do seu perfil.'
        });
    }

    async run({ channel, author })
    {
        const data = await this.client.database.users.findOne(author.id, 'lightTheme');
        await this.client.database.users.update(author.id, { lightTheme: !data.lightTheme });

        channel.send(`${author}, agora seu perfil possui o **tema ${data.lightTheme ? 'escuro' : 'claro'}**`);
    }
}