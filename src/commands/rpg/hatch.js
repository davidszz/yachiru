const { Command, MiscUtils, XPUtils } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'chocar',
            aliases: [ 'hatch' ],
            category: 'RPG',
            description: 'Use para chocar todos os ovos da sua incubadora.'
        });
    }

    async run({ channel, author })
    {
        const userdata = await this.client.database.users.findOne(author.id, 'hatchery dragons xp level');
        const hatchery = userdata.hatchery;

        if (!hatchery.id)
        {
            return channel.send('Você não tem nenhuma **incubadora**.');
        }

        if (!hatchery.eggs || !hatchery.eggs.length)
        {
            return channel.send(`Não há nenhum ovo chocando na sua incubadora.`);
        }

        var soon = 0;
        var wonXp = 0;
        var readyToHatch = [];

        for (const egg of hatchery.eggs)
        {
            const dragon = this.client.dragons.get(egg.id);
            const time = egg.hatchAt - Date.now();

            if (time > 0)
            {
                if (!soon || time < soon)
                {
                    soon = time;
                }
                continue;
            }

            wonXp += dragon.hatchXp;
            readyToHatch.push(egg);
        }

        if (!readyToHatch.length)
        {
            return channel.send(`Nenhum ovo está pronto para ser chocado, aguarde... O mais próximo chocará em \`${MiscUtils.shortDuration(soon, 2)}\``);
        }

        const dragons = userdata.dragons;
        for (const egg of readyToHatch)
        {
            dragons.push({
                id: egg.id,
                level: 1,
                foodStep: 0,
                lastCollectedGold: Date.now()
            });

            hatchery.eggs.splice(hatchery.eggs.indexOf(egg), 1);
        }

        const xpObject = XPUtils.updateXpJson(userdata.xp + wonXp, userdata.level);

        await this.client.database.users.update(author.id, {
            dragons,
            'hatchery.eggs': hatchery.eggs,
            ...xpObject
        });

        channel.send(`Você chocou **${readyToHatch.length}** ovos e recebeu **${wonXp} XP**!`);
        if (xpObject.level)
        {
            channel.send(`Você upou para o nível **${xpObject.level}**!`);
        }
    }   
}