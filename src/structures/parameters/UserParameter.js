module.exports = class UserParameter
{
    constructor(options = {})
    {
        this.acceptSelf = options.acceptSelf || false;
        this.acceptBot = options.acceptBot || false;
    }

    async handle(arg, { client, author, channel })
    {
        arg = arg.replace(/[<@!>]/g, '');
        const user = client.users.cache.get(arg) ||
            await client.users.fetch(arg).catch(() => null);

        if (!user)
        {
            channel.send('Usuário não encontrado.');
            return false;
        }

        if (!this.acceptSelf && user.id == author.id)
        {
            channel.send('O usuário não pode ser **você mesmo**.');
            return false;
        }

        if (!this.acceptBot && user.bot)
        {
            channel.send('O usuário não pode ser um **bot**.');
            return false;
        }

        return user;
    }
}