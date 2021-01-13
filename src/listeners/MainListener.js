const { EventListener } = require('../');

class MainListener extends EventListener 
{
    constructor(client)
    {
        super({
            events: [ 'ready', 'message' ]
        }, client);
    }

    async onReady()
    {
        let i = 0;
        const changeStatus = async () => {
            const shardGuildCount = await this.shard.fetchClientValues('guilds.cache.size');
            const totalGuildCount = shardGuildCount.reduce((total, current) => total + current);

            const activities = [
                {
                    name: `Seu servidor está no shard ${this.shard.ids.toString()}`,
                    type: 'PLAYING'
                },
                {
                    name: `@${this.user.username} ajuda`,
                    type: 'LISTENING'
                }
            ];

            let activity = activities[i++ % activities.length];
            return this.user.setPresence({
                activity,
                status: 'idle'
            });
        };

        changeStatus();
        setInterval(() => {
            changeStatus();
        }, 15000);
    }

    async onMessage(message)
    {
        if (message.author.bot || !this.loaded)
            return;

        const botMention = this.user.toString();
        const prefix = this.prefix;

        const sw = (...s) => s.some(st => message.content.toLowerCase().startsWith(st));
        const usedPrefix = sw(botMention, `<@!${this.user.id}>`) ? `${botMention} ` : sw(prefix.toLowerCase()) ? prefix : null;

        if (usedPrefix)
        {
            const [ cmdName, ...args ] = message.content.slice(usedPrefix.length).trim().split(/ +/g);
            
            const cmd = cmdName.trim().toLowerCase();
            const command = this.commands.find(c => c.name.toLowerCase() === cmd || (c.aliases && c.aliases.includes(cmd)));
            if (command)
            {
                if (!message.member.hasPermission('ADMINISTRATOR'))
                {
                    const commandsChannel = await this.database.guilds.findOne(message.guild.id, 'commandsChannel')
                    .then(res => res.commandsChannel);

                    if (commandsChannel)
                    {
                        if (message.guild.channels.cache.get(commandsChannel))
                        {
                            if (message.channel.id != commandsChannel)
                            {
                                return;
                            }
                        }
                    }
                }

                this.runCommand(command, message, args);
            }
        }
    }
}       

module.exports = MainListener;