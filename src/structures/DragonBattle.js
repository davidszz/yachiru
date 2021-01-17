const DragonUtils = require('../utils/DragonUtils');
const Constants = require('../utils/Constants');
const ElementsData = require('../assets/bin/data/elements.json');
const { MessageEmbed } = require('discord.js');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const socialPointLogo = 'https://images-ext-2.discordapp.net/external/uFXqQHjqAACEejgD1DGDs7mfg9vmvoVisIE_58vXj_Q/%3F1584032796/https/assets.landing.jobs/attachments/companies/logos/a055894e2b46b0efdcff4f8fb934dd5df03abe5f/large.jpg';

class DragonBattle
{
    /**
     * Create a Dragon battle
     * @param {Object} [context] - The context of constructor
     * @param {Client} [context.client] - Bot client
     * @param {TextChannel} [context.channel] - The text channel to start's the battle
     * @param {User} [context.user] - Owner of the battle
     * @param {Object} userDragon - The user dragon 
     * @param {Object} targetDragon - The target dragon
     */
    constructor(context, userDragon, targetDragon)
    {
        this.client = context.client;
        this.channel = context.channel;
        this.user = context.user;

        this.dragon = userDragon;
        this.target = targetDragon;

        this.battle = {
            current: Math.round(Math.random()),
            dragons: [ this.dragon, this.target ]
        };

        this.message = null;
    }

    async start()
    {
        const mention = this.battle.current ? null : this.user;
        const message = await this.channel.send(mention, this.battleEmbed());
        this.message = message;
        return this.startBattle(message);
    }

    startBattle(message)
    {
        return new Promise(async (resolve, reject) => {
            var interval = this.client.setInterval(() => {
                if (message.deleted)
                {
                    reject('message deleted');
                    this.client.clearInterval(interval);
                }    
            }, 1000);

            const onError = (err) => {
                reject(err);
                this.client.clearInterval(interval);
            };

            const reactions = [ '1️⃣', '2️⃣', '3️⃣', '4️⃣' ];
            for (const reaction of reactions)
            {
                await message.react(reaction)
                    .catch(e => e);
            }

            const filter = (r, u) => u.id === this.user.id && reactions.includes(r.emoji.name);
            const collector = message.createReactionCollector(filter, { idle: 60000 });

            const NPCAttack = async () => {
                await delay(3000 + Math.random() * 2000);

                let skill = this.target.skills[Math.floor(Math.random() * this.target.skills.length)];
                while (DragonUtils.damageSize(skill.element, this.dragon.elements[0]) == 0
                    || skill.level > this.target.level)
                {
                    skill = this.target.skills[Math.floor(Math.random() * this.target.skills.length)];
                }

                const infos = {
                    skillName: skill.name,
                    power: this.attack(skill),
                    damage: DragonUtils.damageSize(skill.element, this.dragon.elements[0])
                };

                this.changeCurrent();
                await message.edit(this.battleEmbed(infos))
                    .then(() => {
                        if (this.checkEnd())
                        {
                            resolve(this.checkEnd());
                            this.client.clearInterval(interval);
                            collector.stop();
                            return;
                        }
                    })
                    .catch(onError);
            };

            if (this.battle.current)
                await NPCAttack();

            collector.on('collect', async (r, u) => {
                if (this.battle.current)
                {
                    return r.users.remove(u)
                        .catch(e => e);
                }

                const emoji = reactions.includes(r.emoji.id)
                    ? r.emoji.id : r.emoji.name;

                const idx = reactions.indexOf(emoji);
                const skill = this.current.skills[idx];
                if (skill.level > this.current.level)
                {
                    r.users.remove(u).catch(e => e);
                    return;
                }

                const infos = {
                    skillName: skill.name,
                    power: this.attack(skill),
                    damage: DragonUtils.damageSize(skill.element, this.target.elements[0])
                };

                this.changeCurrent();

                await message.edit(this.battleEmbed(infos))
                    .then(async () => {
                        if (this.checkEnd())
                        {
                            resolve(this.checkEnd());
                            this.client.clearInterval(interval);
                            return;
                        }

                        r.users.remove(u).catch(e => e);
                        await NPCAttack();
                    })
                    .catch(onError);
            });
        });
    }

    battleEmbed(skillInfos = {})
    {
        var { skillName, power, damage } = skillInfos;

        const isUser = !!!this.battle.current;
        
        const userName = `\`👤\` ${this.dragon.name} (lvl. ${this.dragon.level})`;
        const targetName = `${this.target.name} (lvl. ${this.target.level})`;
        
        const skills = [];
        const emojis = [ ':one:', ':two:', ':three:', ':four:' ];
        for (const i in this.dragon.skills)
        {
            let skill = this.dragon.skills[i];
            let element = Constants.emojis[`round_${skill.element}`];

            let desc = `${emojis[i]} ${element}`;
            if (skill.level > this.dragon.level)
            {
                desc += ` :lock:`;
                skills.push(desc);
                continue;
            }
            
            let damage = DragonUtils.damageSize(skill.element, this.target.elements[0]);

            if (damage == 0)
            {
                desc += ` ~~**${skill.name}**~~`;
            }
            else 
            {
                if (damage == 1)
                    damage = '';
                else if (damage == 2)
                    damage = '⇪';
                else if (damage < 1)
                    damage = '⇩';

                desc += ` **${skill.name}** ${damage}`;
            }

            
            skills.push(desc);
        }

        const progressBar = (health, base) => {
            const percent = health / base;
            const repeat = Math.ceil(percent * 10);

            const remaining = '.'.repeat(10 - repeat);
            const progress = '█'.repeat(repeat);

            return `[${progress}${remaining}]`;
        };

        const parseElements = (elements) => {
            return elements.map(x => Constants.emojis[`round_${x}`])
                .join('');
        };
 
        // embed settings
        const color = isUser ? '#00FF00' : '#FF0000';
        const title = isUser ? 'Sua vez!' : `Vez de ${this.target.name}`;

        const embed = new MessageEmbed()
            .setColor(color)
            .addField(userName, [
                `**HP:** ${this.dragon.health}/${this.dragon.startHealth}`,
                `\`${progressBar(this.dragon.health, this.dragon.startHealth)}\``,
                `Elementos: ${parseElements(this.dragon.elements)}`
            ], true)
            .addField(targetName, [
                `**HP:** ${this.target.health}/${this.target.startHealth}`,
                `\`${progressBar(this.target.health, this.target.startHealth)}\``,
                `Elementos: ${parseElements(this.target.elements)}`
            ], true)
            .addField('SKILLS', skills)
            .setFooter('As imagens usadas no bot são retiradas de um jogo chamado Dragon City feito pela Social Point.', socialPointLogo)
            .setTitle(title);

        if (power != null)
        {
            if (damage < 1 && damage > 0)
                power = `${power}⇩`;
            if (damage == 2)
                power = `${power}⇪`;

            let message = `${!isUser ? 'Você' : this.target.name} causou ${power} de dano em ${!isUser ? this.target.name : 'você'} com seu(ua) ${skillName}`;
            embed.addField('\u200B', '```' + message + '```');
        }

        return embed;
    }

    checkEnd()
    {
        if (this.dragon.health <= 0)
            return { won: false };
        if (this.target.health <= 0)
            return { won: true };

        return false;
    }

    attack(skill)
    {
        var { element, power } = skill;
        
        var primaryElement = this.nonCurrent.elements[0];
        var damage = DragonUtils.damageSize(element, primaryElement);
        
        power *= damage;

        if (this.nonCurrent.health < power)
            this.nonCurrent.health = 0;
        else this.nonCurrent.health -= power;

        return power;
    }

    changeCurrent()
    {
        return this.battle.current = this.battle.current ? 0 : 1;
    }

    get current() 
    {
        return this.battle.dragons[this.battle.current];
    }

    get nonCurrent()
    {
        return this.battle.dragons[this.battle.current ? 0 : 1];
    }
}

module.exports = DragonBattle;