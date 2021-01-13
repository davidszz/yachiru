const channelTypes = {
    'text': 'texto',
    'voice': 'voz',
    'dm': 'mensagem privada',
    'news': 'anúncios'
};

module.exports = class UserParameter
{
    constructor(options = {})
    {
        this.channelType = options.channelType || '';
    }

    async handle(arg, { channel, guild })
    {
        arg = arg.replace(/[<@#>]/g, '');
        const ch = guild.channels.cache.get(arg);

        if (!ch)
        {
            channel.send('Nenhum canal foi encontrado.');
            return false;
        }

        if (this.channelType && ch.type !== this.channelType)
        {
            channel.send(`O canal deve ser do tipo **${channelTypes[this.channelType]}**.`);
            return false;
        }

        return ch;
    }
}