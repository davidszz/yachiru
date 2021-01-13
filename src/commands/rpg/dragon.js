const { MessageAttachment } = require('discord.js');
const { Command, CanvasTemplates } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'dragão',
            aliases: [ 'dragon', 'drag' ],
            category: 'RPG',
            description: 'Obtem informações detalhas sobre um dragão.',
            usage: '<id>',
            examples: [
                '2'
            ],
            parameters: [
                {
                    type: 'string',
                    validate: (val) => /^\d+/g.test(val) && Number(val) > 0 && Number.isInteger(Number(val)),
                    errors: {
                        validate: `Forneça um id **válido** que contenha apenas **números** acima de **0**.`
                    },
                    required: true
                }
            ]
        })
    }

    async run(message, [ id ])
    {   
        const { channel, author } = message;

        channel.startTyping()
            .catch(e => e);

        const player = await this.client.players.get(author.id);
        const dragons = await player.dragons.all(true);

        id = parseInt(id);
        let dragon = dragons[id - 1];
        if (!dragon)
        {
            channel.stopTyping(true);
            return channel.send(`Nenhum dragão com o id **${id}** foi encontrado.`);
        }   

        const infos = dragon.infos;
        const data = dragon.data;

        const elements = infos.elements.map(el => `src/assets/images/${el}-element.png`);
        const level = data.level;

        const dragonInfos = {
            name: infos.name,
            nickname: data.nickname || null,
            elements,
            skills: infos.skills,
            health: infos.health,
            gold: infos.goldMinute,
            food: infos.nextFood,
            level,
            description: infos.description,
            dragonImage: infos.icons[(Object.keys(infos.icons).reduce((p, n) => Number(n) > Number(p) && Number(n) <= level ? n : p).toString())]
        };

        const buffer = await CanvasTemplates.dragonInfos(dragonInfos);
        const attachment = new MessageAttachment(buffer, 'dragon-infos.png');

        await message.yachiruReply(attachment);
        channel.stopTyping(true);
    }
}