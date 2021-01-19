const { Command, MiscUtils } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'status',
            description: 'Obtem informações de quanto expira o bot no servidor.',
            category: 'Financeiro',
            tool: true
        });
    }

    async run(message)
    {
        const { guild } = message;
        const data = await this.client.database.guilds.findOne(guild.id, 'expiresAt');
        const expiresAt = data.expiresAt;

        message.reply(expiresAt > Date.now() ? `Expira em: ${MiscUtils.parseDuration(expiresAt - Date.now(), 2, [ 'd', 'h' ])}` : 'Já expirou.');
    }
}