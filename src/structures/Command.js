const { MessageEmbed } = require("discord.js");
const parameters = require('./parameters');

module.exports = class Command 
{
    constructor(client, name, options = {})
    {
        this.client = client;
        
        this.name = options.name || name;
        this.aliases = options.aliases || [];
        this.category = options.category || 'Geral';
        this.description = options.description || '';
        this.usage = options.usage || '';
        this.examples = options.examples || [];
        this.permissions = options.permissions || [];
        this.owner = options.owner || false;
        this.developer = options.developer || false;
        this.hidden = options.hidden || false;
        this.parameters = options.parameters || [];
        this.maintence = options.maintence || false;
        this.guild = options.guild || '';
        this.canvas = options.canvas || false;
        this.prefix = client.prefix || process.env.PREFIX || 'y!';
    }

    get fullname()
    {
        return `${this.prefix}${this.name}`;
    }

    async _run(context, args = [])
    {
        const message = context.message;
        const { channel, author, guild } = message;

        if (this.canvas && !this.client.canvasLoaded)
        {
            return channel.send(`Este comando não pode ser executado no momento pelo motivo: \`Canvas não foi inicializado corretamente\``);
        }

        if (this.parameters && this.parameters.length)
        {
            const length = this.parameters.length;
            for (let i = 0; i < length; i++)
            {
                const parameter = this.parameters[i];
                if (!args[i])
                {
                    if (parameter.required)
                    {
                        channel.send(this.usageMessage(guild.me.displayHexColor));
                        return;
                    }

                    continue;
                }

                const type = parameter.type || 'string';
                if (type === 'user')
                {
                    const userParam = new parameters.UserParameter(parameter);
                    const userHandle = await userParam.handle(args[i], { client: this.client, author, channel });
                    if (!userHandle) return;

                    args[i] = userHandle;
                }

                if (type === 'string')
                {
                    const strParam = new parameters.StringParameter(parameter);
                    const strHandle = strParam.handle(args[i], { channel, index: i });
                    if (!strHandle) return;

                    args[i] = strHandle;
                }
            }
        }

        this.run(message, args);
    }

    usageMessage(color)
    {
        return new MessageEmbed()
            .setColor(color)
            .setAuthor(`Modo de uso correto:`)
            .setDescription([
                `\`${this.prefix}${this.name}${this.usage ? ` ${this.usage}` : ''}\` ${this.description}`
            ]);
    }

    async run(message, args)
    {
        message.reply(`This is a new empty command!`);
    }
}