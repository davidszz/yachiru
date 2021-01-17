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

    async run(message, [ id ])
    {
        const author = message.author;

        const dragons = await this.client.database.users.findOne(author.id, 'dragons')
            .then(res => res.dragons);

        if (!dragons.length)
        {
            return message.reply(`você não possui nenhum **dragão**.`);
        }

        const idx = Number(id) -1;
        const dragon = dragons[idx];

        if (!dragon)
        {
            return message.reply(`nenhum dragão com esse **id** foi encontrado.`);
        }

        if (dragon.equipped)
        {
            return message.reply(`esse dragão já esta **equipado**.`);
        }

        if (dragon.level < 4)
        {
            return message.reply(`seu dragão deve estar no level **4** ou superior para ser equipado.`);
        }

        for (const dragon of dragons)
        {
            if (dragon.equipped)
                delete dragon.equipped;
        }

        dragon.equipped = true;
        dragons[idx] = dragon;

        const infos = this.client.dragons.get(dragon.id);

        await this.client.database.users.update(author.id, { dragons });
        message.reply(`você equipou seu(ua) **${infos.name}** com id **${id}**!`);
    }
}