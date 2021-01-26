const { Command } = require('../../'); 

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'canal-de-comandos',
            aliases: [ 'commands-channel', 'channel-commands' ],
            category: 'Configuração',
            description: 'Defina um unico canal em que meus comandos poderão ser utilizados.',
            usage: '<canal ou remove>',
	    permissions: [ 'ADMINISTRATOR' ], 
            examples: [
                '#Yachiru',
                '796832689352081428'
            ],
            parameters: [
                {
                    type: 'string',
                    returnsLower: true,
                    required: true
                }
            ]
        });
    }
    
    async run({ channel, guild }, [ param ])
    {
        const words = [
            'remove', 'delete', 'rem', 'del', 'remover', 'deletar'
        ];

        const ch = guild.channels.cache.get(param.replace(/[<@#>]/g, ''));

        if (!words.includes(param) && !ch)
        {
            return channel.send(this.usageMessage());    
        }

        const guildData = await this.client.database.guilds.findOne(guild.id, 'commandsChannel');
        
        if (words.includes(param.toLowerCase()))
        {
            if (!guildData.commandsChannel)
            {
                return channel.send(`Não há nenhum **canal único** de comandos definido até o momento.`);
            }

            await this.client.database.guilds.update(guild.id, {
                "$unset": {
                    "commandsChannel": ""
                }
            });

            channel.send(`O **canal de comandos** foi removido. Agora meus comandos podem ser usados em qualquer canal.`);
        }
        else 
        {
            if (ch.type !== 'text')
            {
                return channel.send(`O canal deve ser do tipo **texto**.`);
            }

            if (guildData.commandsChannel == ch.id)
            {
                return channel.send(`O novo canal não pode ser igual ao atual.`);
            }

            await this.client.database.guilds.update(guild.id, {
                "commandsChannel": ch.id
            });

            channel.send(`Você definiu o **canal de comandos** como ${ch.toString()}`);
        }
    }
}