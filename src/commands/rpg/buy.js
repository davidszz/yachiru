const { MessageEmbed } = require('discord.js');
const { Command, MiscUtils, ItemsData, CommandError } = require('../../');
const { alphaString } = MiscUtils;
const BuyTypes = require('../../structures/buy');

const isNum = (arg) => !isNaN(arg) && Number.isInteger(Number(arg));

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'buy',
            aliases: [ 'comprar' ],
            category: 'RPG',
            description: 'Compra     um item da loja.',
            usage: '<item> [quantidade: 1]',
            examples: [
                'ovo de dragão de fogo',
                'ovo de dragão de agua 1'
            ]
        });
    }

    async run(message, args)
    {
        const { channel, author, guild } = message;

        if (!args.length)
        {
            return channel.send(this.usageMessage(guild.me.displayHexColor));
        }

        const fields = 'money inventory farms structures incubator level';
        const userdata = await this.client.database.users.findOne(author.id, fields);
        const { money, inventory, farms, structures, incubator } = userdata;

        const items_ = Object.values(ItemsData).flat();

        const content = alphaString(args.join(' ')).toLowerCase();
        const item = items_
            .filter(i => content.startsWith(alphaString(i.name).toLowerCase()))
            .reduce((p, n) => p.name ? (n.name.length >= p.name.length ? n : p) : n, {});

        if (!item || !Object.keys(item).length)
        {
            return channel.send('Item não encontrado na loja.');
        }

        if (item.avaliable != null && !item.avaliable)
        {
            return channel.send('Este item não esta a venda no momento.');
        }

        let lastArg = content.slice(item.name.length).trim().split(/ +/g)[0];
        let amount = 1;

        if (lastArg)
        {
            amount = isNum(lastArg) ? parseInt(lastArg) : 0;
        }

        if (!amount)
        {
            return channel.send('Forneça uma quantidade **válida** acima de **0**.');
        }

        if (item.level && userdata.level < item.level)
        {
            return channel.send(`Você precisa estar no nível **${item.level}** ou superior para comprar este item.`);
        }

        if (item.limit)
        {
            const hasAmount = inventory[item.id] && inventory[item.id].amount || 0;
            if ((amount + hasAmount) > item.limit)
            {
                let remaining = item.limit - hasAmount;
                if (remaining)
                {
                    return channel.send(`Você só pode comprar mais **${item.limit - hasAmount}x** deste item.`);
                }
                
                return channel.send(`Você já possui o **máximo (${item.limit})** permitido deste item.`)
            }
        }

        const cost = amount * item.price;
        if (money < cost)
        {
            return channel.send(`Você não possui **${MiscUtils.formatCurrency(cost)}** para comprar **${amount}x ${item.name}**`);
        }

        const category = Object.keys(ItemsData)
            .find(x => ItemsData[x].find(i => i.id == item.id));

        const context = {
            channel, author, guild, item, amount, cost
        };

        const data = {
            farms, structures, inventory, incubator
        };

        try
        {
            const BuyType = new BuyTypes[category](this.client);
            await BuyType.handle(context, data);
            
            channel.send(`Você comprou **${amount}x ${item.name}** por **${MiscUtils.formatCurrency(cost)}**`);
        }
        catch(err)
        {
            if (err instanceof CommandError)
            {
                if (err.message == 'EMBED_ERROR')
                {
                    channel.send(err.embed ? err.embed : 'Ocorreu um erro');
                }
                else 
                {
                    const embed = new MessageEmbed()
                        .setAuthor('❌ Algo deu errado')
                        .setDescription(err.message)

                    message.yachiruReply(embed.setColor('#ff0000'));
                }
            }
            else 
            {
                channel.send(`Ocorreu um erro: \`\`\`${err.toString()}\`\`\``);
            }
        }
    }
}