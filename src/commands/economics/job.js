const { MessageEmbed } = require('discord.js');
const { Command, FlagUtils, Constants } = require('../../');

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'trabalho',
            aliases: [ 'job', 'work', 'trabalhar' ],
            category: 'Economia',
            description: 'Trabalhe para ganhar dinheiro!',
            canvas: true
        });
    }

    async run(message)
    {
        const { channel, author } = message;

        const userdata = await this.client.database.users.findOne(author.id, 'job');
        const userjob = { status: 0, lastJob: 0, id: 1, ...(userdata.job) };

        if (!userjob.id)
        {
            return channel.send(`Você não possui nenhum **emprego** até o momento.`)
                .then(async (msg) => {
                    await msg.react(Constants.emojis.question)
                        .catch(e => e);

                    const filter = (r, u) => u.id === author.id && Object.values(r.emoji).includes(Constants.emojis.question);
                    msg.awaitReactions(filter, { time: 60000, max: 1 })
                        .then(() => {
                            channel.send(`Para conseguir um **emprego** use \`@${this.client.user.username} empregos\``);
                        })
                        .catch(err => err);
                });
        }

        const jobInfo = FlagUtils.getJob(userjob.id);
        if (!jobInfo)
        {
            return message.yachiruReply('Ocorreu um erro: ```' + 'Provalmente o emprego que você possui foi removido do arquivo de configuração do bot, caso o erro venha a acontecer novamente avise um desenvolvedor sobre o ocorrido e receba recompensas.' + '```')
        }

        // 0: Avaliable
        if (!userjob.status)
        {
            
        }
        // 1: Working
        else if (userjob == 1)
        {

        }
        // 2: Salary avaliable
        else if (userjob == 2)
        {

        }
    }

    jobProgress(user, progress, reaming, jobName)
    {
        let color = progress < 40 ? '#FF0000' : progress < 80 ? '#FFFF00' : '#00FF00';
        let char = '•';
        let repeats = parseInt((progress / 100) * 15);

        let worker = `👷${parseInt(progress)}%`;
        let firstRepeats = char.repeat(repeats);
        let lastRepeats = char.repeat(15 - repeats);

        const embed = new MessageEmbed()
            .setColor(color)
            .setAuthor(jobName, user.avatarIcon())
            .setDescription('```⛏ ' + `${firstRepeats}${worker}${lastRepeats}` + ' 💰```')
            .setFooter(`Restante: ${reaming}`, this.client.user.avatarIcon());

        return embed;
    }
}