const { MessageEmbed } = require('discord.js');
const { Command, CommandError, XPUtils } = require('../../');
const Uses = require('../../structures/commands/use');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'usar',
            aliases: [ 'use' ],
            category: 'RPG',
            description: 'Usa um item do seu inventário.',
            usage: '<id>',
            examples: [
                '1011'
            ],
            parameters: [
                {
                    type: 'string',
                    validate: (val) => !isNaN(val) && Number(val) > 0 && Number.isInteger(Number(val)),
                    errors: {
                        validate: 'Forneça um id **válido** contendo **apenas números**.'
                    },
                    required: true
                }
            ]
        });
    }

    async run(message, [ id ])
    {
        const { channel, author } = message;

        const userdata = await this.client.database.users.findOne(author.id, 'inventory hatchery temples dragons farms xp level');
        const inventory = userdata.inventory;

        if (!inventory[id])
        {
            return message.reply(`você não possui nenhum item com este id.`);
        }

        const item = this.client.items.get(id);
        if (item.usable != null && !item.usable)
        {
            return message.reply(`este item não pode ser utilizado desta maneira.`);
        }

        try 
        {
            const UseType = Uses[item.type];
            const useItem = new UseType(this.client);

            const xpJson = item.xp ? XPUtils.updateXpJson(userdata.xp + item.xp, userdata.level) : null;

            await useItem.handle({
                channel, author, item,
                inventory: userdata.inventory,
                hatchery: userdata.hatchery,
                dragons: userdata.dragons,
                farms: userdata.farms,
                temples: userdata.temples,
                xpJson
            });

            if (xpJson && xpJson.level)
            {
                message.reply(`você upou para o nível **${xpJson.level}**!`);
            }
        }
        catch(err)
        {
            if (!(err instanceof CommandError))
            {
                console.log(err);
                return channel.send(`Ocorreu um erro: \`\`\`${err}\`\`\``);
            }

            if (err.message == 'EMBED_ERROR')
            {
                return channel.send(err.embed);
            }

            const embed = new MessageEmbed()
                .setColor('#FF0000')
                .setAuthor('❌ Oops! Algo deu errado')
                .setDescription(err.message);

            return channel.send(embed);
        }
    }
}