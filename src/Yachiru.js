const Discord = require('discord.js');
const chalk = require('chalk');
const _ = require('lodash');
const Loaders = require('./loaders');
const Lang = require('./lang/pt-BR.json');

class Yachiru extends Discord.Client 
{
    constructor(options = {})
    {
        super(options)

        this.canvasLoaded = options.canvasLoaded;
        this.shardId = options.shardId;

        this.logError = this.logError.bind(this);
        this.loaded = false;
        this.prefix = process.env.PREFIX;
    }

    async initialize() 
    {
        const loaders = Object.values(Loaders).map(L => new L(this));
        const [ preLoad, normal ] = loaders.reduce(
            ([ pl, n ], l) => l.preLoad ? [ [ ...pl, l ], n ] : [ pl, [ ...n, l ] ], [ [], [] ]
        );

        let dbLoader = preLoad.find(
            l => Object.keys(l)[3] === 'database'
        );
        let oldLoader = preLoad[0];

        let preLoaders = preLoad;
        preLoaders[preLoad.indexOf(dbLoader)] = oldLoader;
        preLoaders[0] = dbLoader;

        for (const loader of preLoaders)
        {
            await loader.load();
        }

        try 
        {
            require('./modules/YachiruReply');
            require('./modules/DiscordPrototypes');
        }
        catch(err)
        {
            // Nothing
        }

        await this.login()
            .then(() => this.log('Logged in successfully', { color: 'green', tags: [ 'Discord' ] }))
            .catch(this.logError);

        for (const loader of normal)
        {
            await loader.load();
        }
        
        this.loaded = true;
        this.emit('loaded');
    }

    log(message, { tags = [], bold = false, italic = false, underline = false, reversed = false, bgColor = false, color = 'white' } = {}) 
    {
        const colorFunction = _.get(chalk, [bold, italic, underline, reversed, bgColor, color].filter(Boolean).join('.'))
        console.log(...tags.map(t => chalk.cyan(`[${t}]`)), colorFunction(message))
    }

    logError(...args) 
    {
        const tags = args.length > 1 ? args.slice(0, -1).map(t => `[${t}]`) : []
        console.error('[ErrorLog]', ...tags, args[args.length - 1])
    }

    async runCommand(command, message, args)
    {
        const avaliable = await this.checkCommand(command, message);
        if (!avaliable) return;

        this.log(`#${message.channel.name} <${message.author.tag}>: ${message.content.slice(0, 150)}`, { color: 'magenta', tags: [ message.guild.name ] });
        return command._run({
            message
        }, args).catch(this.logError);
    }

    async checkCommand(command, message)
    {
        const { author, channel, guild, member } = message;

        if (command.developer || command.maintence)
        {
            const developers = process.env.DEVELOPERS?.split(',').map(id => id.trim()) || [];
            if (!developers.includes(author.id))
            {
                if (command.maintence)
                {
                    channel.send('Este comando está em **manutenção**.');
                }
                else 
                {
                    channel.send('Este comando pode ser utilizado apenas por **desenvolvedores**.');
                }
                return false;
            }
        }

        if (command.guild)
        {
            if (guild.id !== command.guild)
            {
                return false;
            }
        }

        if (command.owner)
        {
            if (guild.ownerID !== author.id)
            {
                channel.send(`Somente o **dono do servidor** (${guild.owner.displayName}) pode utilizar este comando.`);
                return false;
            }
        }

        if (command.permissions)
        {
            if (typeof command.permissions === 'string')
            {
                if (!member.hasPermission(command.permissions))
                {
                    channel.send(`É necessário a permissão de **${Lang.permissions[command.permissions] || command.permissions}** para utilizar este comando.`);
                    return false;
                }
            }
            else
            {
                const discordPermissions = Object.keys(Discord.Permissions.FLAGS);
                const permissions = command.permissions
                    .map(perm => perm.toUpperCase())
                    .filter(perm => discordPermissions.includes(perm));
                
                if (!member.hasPermission(permissions))
                {
                    channel.send(`São necessárias as permissões **${permissions.map(p => Lang.permissions[p] || p).join(', ')}** para utilizar este comando.`);
                    return false;
                }
            }
        }

        return true;
    }
}

module.exports = Yachiru;