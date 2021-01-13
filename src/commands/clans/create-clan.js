const { Command, ClanUtils, MiscUtils } = require('../../');

const COST = 50000;
module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'create-clan',
            aliases: [ 'clan-create', 'ccreate', 'cclan' ],
            description: 'Crie seu clã e avance no ranking de clãs.',
            category: 'Clans',
            usage: '<tag> <nome>',
            maintence: true,
            hidden: true,
            developer: true,
            examples: [
                'DCC Discord Community'
            ],
            parameters: [
                {
                    type: 'string',
                    minLength: 3,
                    maxLength: 4,
                    required: true,
                    validate: (val) => val.match(/^[a-zA-Z0-9]+$/i),
                    errors: {
                        validate: "A **tag** do clã deve conter apenas caracteres **alfanuméricos**.",
                        minLength: "A **tag** do clã deve conter no minimo `3` caracteres.",
                        maxLength: "A **tag** do clã não pode exceder o limite de `4` caracteres."
                    }
                },
                {
                    type: 'string',
                    minLength: 3,
                    maxLength: 24,
                    required: true,
                    validate: (val) => val.match(/^[a-zA-Z0-9 ]+$/i),
                    errors: {
                        validate: "O nome do seu **clã** deve conter somente caracteres **alfanuméricos**.",
                        minLength: "O nome do seu **clã** deve conter no minimo `3` caracteres.",
                        maxLength: "O nome do seu **clã** deve conter no máximo `24` caracteres."
                    }
                }
            ]
        });
    }

    async run({ channel, author }, [ clanTag, clanName ])
    {
        const userdata = await this.client.database.users.findOne(author.id, 'clan money');
        if (userdata.clan && userdata.clan.id != null)
        {
            return channel.send('Você já possui um **clã**.');
        }

        const sameClan = await ClanUtils.clanExists(this.client, clanTag);
        if (sameClan)
        {
            return channel.send(`Um clã com a tag **${clanTag.toLowerCase()}** já existe.`);
        }

        const money = userdata.money;
        if (money < COST)
        {
            return channel.send(`Você não possui **${MiscUtils.formatCurrency(COST)}** para criar um clã.`);
        }

        channel.startTyping()
            .catch(e => e);

        const sequence = await this.client.counters.sequence('clans');
        await this.client.database.clans.update(sequence, {
            tag: clanTag.toLowerCase(),
            name: clanName,
            owner: author.id
        });

        await this.client.database.users.update(author.id, {
            clan: {
                id: sequence
            }
        });

        channel.stopTyping(true);
        channel.send(`Você criou o clã **[${clanTag.toUpperCase()}] ${clanName}**. Use \`${this.client.prefix}clan-invite <membro>\` para convidar um membro para o seu clã.`);
    }
}