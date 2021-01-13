const { Command, MiscUtils, YachiruEmbed } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'ajuda',
            aliases: [ 'help', 'cmds', 'commands', 'comandos' ],
            description: 'Lista todos comandos do bot.',
            category: 'Misc',
            usage: '[comando]',
            examples: [ 'perfil' ],
            parameters: [
                {
                    type: 'string'
                }
            ]
        });
    }

    async run({ channel, author }, [ cmdName ])
    {
        if (!cmdName)
        {
            const embed = new YachiruEmbed()
                .setAuthor('Yachiru Bot - Comandos', this.client.user.avatarIcon())
                .setDescription([
                    `O prefixo do bot é \`${this.client.prefix}\` mas você pode usar também ${this.client.user.toString()} como prefixo.`,
                    `Use **\`${this.fullname} ${this.usage}\`** para informações detalhadas sobre um comando.`,
                    `\u2022 Servidor de suporte: **[clique aqui](https://discord.gg/TGYkqpgK4h)**`,
                    `\u2022 Total de comandos: \`${this.client.commands.length}\``
                ])
                .setFooter(author.tag, author.avatarIcon())
                .setTimestamp();

            const commands = this.client.commands;
            const categories = {};
            
            for (const command of commands)
            {
                if (command.hidden) continue;

                if (!categories[command.category])
                    categories[command.category] = [];
                    
                categories[command.category].push(command);
            }

            for (const category in categories)
            {
                embed.addField(`${category} (${categories[category].length})`, categories[category].map(x => `\`${x.name}\``).join(', '));
            }

            return channel.send(embed);
        }

        cmdName = MiscUtils.alphaString(cmdName);
        const command = this.client.commands
            .find(x => MiscUtils.alphaString(x.name).toLowerCase() == cmdName
                || x.aliases.some(y => MiscUtils.alphaString(y) == cmdName));

        if (!command)
        {
            return channel.send(`Comando não **encontrado**.`);
        }

        const commandEmbed = new YachiruEmbed()
            .setTitle(`Ajuda do comando \`${cmdName}\``)
            .setDescription(command.description || 'Sem descrição.')
            .addField('Nome:', command.name, true)
            .addField('Categoria:', command.category, true)
            .addField('Sinônimos:', command.aliases && command.aliases.length ? '`' + command.aliases.join('`, `') + '`' : 'Nenhum.', true)
            .addField('Modo de uso:', `\`${command.fullname} ${command.usage}\``, true)
            .addField('Exemplos:', command.examples && command.examples.length ? command.examples.map(x => `\`${command.fullname} ${x}\``).join('\n') : 'Nenhum.', true);

        channel.send(commandEmbed);
    }
}