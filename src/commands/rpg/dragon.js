const { MessageAttachment } = require('discord.js');
const { Command, CanvasTemplates, DragonUtils } = require('../../');

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

        const path = '../../utils/CanvasTemplates.js';
        delete require.cache[require.resolve(path)];
        const CanvasTemplates = require(path);

        const dragons = await this.client.database.users.findOne(author.id, 'dragons')
            .then(res => res.dragons);

        id = parseInt(id);
        const dragon = dragons[id - 1];
        if (!dragon)
        {
            channel.stopTyping(true);
            return message.reply('nenhum dragão com esse id foi encontrado.');
        }   

        const infos = this.client.dragons.get(dragon.id);

        const elements = infos.elements.map(el => `src/assets/images/${el}-element.png`);
        const level = dragon.level;

        const dragonInfos = {
            name: infos.name,
            elements,
            skills: infos.skills,
            health: DragonUtils.healthLevel(level, infos.baseHealth),
            gold: DragonUtils.goldMinute(level, dragon.id),
            food: DragonUtils.nextFood(level),
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