const { Command, MiscUtils, EggsData } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'hatch',
            aliases: [ 'chocar' ],
            category: 'RPG',
            description: 'Use para chocar todos os ovos da sua incubadora.'
        });
    }

    async run({ channel, author })
    {
        const userdata = await this.client.database.users.findOne(author.id, 'incubator dragons');
        
        const eggs = userdata.incubator.eggs || [];
        if (!eggs.length)
        {
            return channel.send('Não possui nenhum **ovo** chocando na sua incubadora.');
        }   

        let hatchEggs = [];
        let soon = 0; 

        for (let egg of eggs)
        {
            if (egg.endsAt <= Date.now())
            {
                hatchEggs.push(egg);
            }
            else 
            {
                if (!soon || soon > eggs.endsAt)
                {
                    soon = egg.endsAt;
                }
            }
        }

        if (!hatchEggs.length)
        {
            return channel.send(`Nenhum **ovo** da sua incubadora está pronto. O mais próximo chocará \`${MiscUtils.fromNow(soon)}\`.`);
        }


        let newDragons = userdata.dragons || [];
        for (let egg of hatchEggs)
        {
            newDragons.push({
                id: egg.id,
                level: 1,
                lastCollectedGold: Date.now(),
                foodStep: 1
            });
        }

        await this.client.database.users.update(author.id, {
            dragons: newDragons,
            'incubator.eggs': eggs.filter(x => !hatchEggs.includes(x))
        });

        channel.send(`**${hatchEggs.length == eggs.length ? 'Todos' : hatchEggs.length}** ovos da sua incubadora foram chocados.`);
    }
}