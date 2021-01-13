const { Command, DragonsData } = require('../../');

module.exports = class extends Command
{
    constructor(...args)
    {
        super(...args, {
            name: 'equipar',
            aliases: [ 'equip' ],
            category: 'RPG',
            description: 'Equipe um de seus dragões para a batalha!',
            usage: '<id>',
            examples: [ '5' ],
            parameters: [
                {
                    type: 'string',
                    validate: (val) => !isNaN(val) && Number(val) > 0 && Number.isInteger(Number(val)),
                    errors: {
                        validate: 'Forneça um **id** válido acima de **0**.'
                    },
                    required: true
                }
            ]
        });
    }

    async run({ channel, author }, [ id ])
    {
        const userdata = await this.client.database.users.findOne(author.id, 'dragons equippedDragon level');
        if (userdata.level < 5)
        {
            return channel.send(`Você precisa estar no minímo **5** antes de equipar um dragão.`);
        }

        if (!userdata.dragons.length)
        {
            return channel.send(`Você não possui **nenhum** dragão.`);
        }

        id = Number(id);
        let idx = id - 1;

        if (!userdata.dragons[idx])
        {
            return channel.send(`Nenhum dragão com o id **${id}** foi encontrado.`);
        }

        if (userdata.equippedDragon === idx)
        {
            return channel.send('Esse dragão **já está** equipado.');
        }

        const dragon = userdata.dragons[idx];
        if (dragon.level < 4)
        {
            return channel.send(`Seu dragão precisa estar no level **4** ou superior para ser equipado.`);
        }
        
        await this.client.database.users.update(author.id, {
            equippedDragon: idx
        });

        const dragonInfos = DragonsData[dragon.id];

        channel.send(`Você equipou seu **${dragon.nickname || dragonInfos.name} (lvl. ${dragon.level})** com o id **${id}** com sucesso!`);
    }
}