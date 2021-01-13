const DragonUtils = require('../utils/DragonUtils');
const Constants = require('../utils/Constants');
const YachiruEmbed = require('./YachiruEmbed');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class DragonBattle
{
    /**
     * 
     * @param {Object} [context] - The context of constructor
     * @param {Client} [context.client] - Bot client
     * @param {TextChannel} [context.channel] - The text channel to start's the battle
     * @param {User} [context.user] - Owner of the battle
     * @param {Object} dragonA 
     * @param {Object} dragonB 
     */
    constructor(context, userDragon, targetDragon)
    {
        this.client = context.client;
        this.channel = context.channel;
        this.user = context.user;
        
        this.userDragon = userDragon;
        this.targetDragon = targetDragon;

        this.userDragon.infos.baseHealth = userDragon.infos.health;
        this.targetDragon.infos.baseHealth = targetDragon.infos.health;

        this.battle = {
            currentDragon: Math.round(Math.random()),
            dragons: [ this.userDragon, this.targetDragon ]
        }

        this.message = null;
    }

    async start()
    {
        const message = await this.channel.send(this.battleEmbed());
        this.message = message;
        return this.battleCommands(message);
    }

    async battleCommands(message)
    {
        return new Promise(async (resolve, reject) => {
            var interval = this.client.setInterval(() => {
                if (message.deleted)
                {
                    reject('message deleted');
                    this.client.clearInterval(interval);
                }    
            }, 1000);
            
            const reactions = [ '1️⃣', '2️⃣', '3️⃣', '4️⃣' ];
            for (const reaction of reactions)
            {
                await message.react(reaction)
                    .catch(e => e);
            }

            const filter = (r, u) => u.id === this.user.id && reactions.includes(r.emoji.name);
            const collector = message.createReactionCollector(filter, { idle: 60000 });

            const computerAttack = async () => {
                await delay(3000 + Math.random() * 2000);

                const dragon = this.targetDragon;
                const infos = dragon.infos;

                const randSkill = infos.skills[Math.floor(Math.random() * infos.skills.length)];
                const damage = this.damageAmount(randSkill);

                const attackInfo = {
                    skill: randSkill,
                    power: damage.amount,
                    powerLevel: damage.type
                };

                this.reduceHealth(damage.amount);
                this.changeCurrent();

                await message.edit(this.battleEmbed(attackInfo))
                    .catch(e => {
                        reject(e);
                        this.client.clearInterval(interval);
                    });

                    
                if (this.checkEnd())
                {
                    resolve(this.checkEnd());
                    this.client.clearInterval(interval);
                    return;
                }
            };

            if (this.battle.currentDragon)
            {
                await computerAttack();
            }

            collector.on('collect', async (r, u) => {
                if (this.battle.currentDragon)
                {
                    r.users.remove(u)
                        .catch(e => e);
                    return;
                }

                const emoji = reactions.includes(r.emoji.id) 
                    ? r.emoji.id : r.emoji.name;

                const idx = reactions.indexOf(emoji);
                const skill = this.current.infos.skills[idx];
                const damage = this.damageAmount(skill);

                this.reduceHealth(damage.amount);

                const attackInfo = {
                    skill,
                    power: damage.amount,
                    powerLevel: damage.type
                };

                this.changeCurrent();
                await message.edit(this.battleEmbed(attackInfo))
                    .catch(e => {
                        reject(e);
                        this.client.clearInterval(interval);
                    });

                r.users.remove(u).catch(e => e);

                if (this.checkEnd())
                {
                    resolve(this.checkEnd());
                    this.client.clearInterval(interval);
                    return;
                }
                await computerAttack();
            });

            collector.on('end', (reason, collected) => {
                if (reason == 'idle')
                {
                    reject(reason);
                    this.client.clearInterval(interval);
                }
            });
        });
    }
    
    checkEnd()
    {
        if (this.userDragon.infos.health <= 0)
        {
            return { win: false };
        }
        else if (this.targetDragon.infos.health <= 0)
        {
            return { win: true };
        }

        return false;
    }

    battleEmbed(attackInfos)
    {
        const isUser = this.battle.currentDragon < 1 ? true : false;

        const current = this.current.infos;
        const dragonName = this.current.data.nickname || current.name;
        const targetName = this.nonCurrent.data.nickname || this.nonCurrent.infos.name;

        const userDragon = this.userDragon;
        const targetDragon = this.targetDragon;

        const userInfos = userDragon.infos;
        const targetInfos = targetDragon.infos;

        const userDGName = userDragon.data.nickname || userDragon.infos.name;
        const targetDGName = targetDragon.data.nickname || targetDragon.infos.name;

        const progressBar = (progress, char = '█') => {
            progress = progress > 0 ? progress : 0;
            return `[${char.repeat(parseInt(progress * 10))}${'.'.repeat(10 - parseInt(progress * 10))}]`;
        };

        const parseElements = (elements) => elements.map(x => Constants.emojis[`round_${x}`]).join('');

        const parseInfos = (infos) => {
            return [
                `**HP:** ${infos.health > 0 ? infos.health : 0}/${infos.baseHealth}`,
                `\`${progressBar(infos.health / infos.baseHealth)}\``,
                `Elementos: ${parseElements(infos.elements)}`
            ];
        };

        const userDragonSkills = userInfos.skills;
        for (const skill of userDragonSkills)
        {
            skill.powerLevel = 'normal';
            for (let element of targetInfos.elements)
            {
                let comparation = DragonUtils.compareElements(skill.element, element);
                if (comparation == 'strong')
                {
                    skill.powerLevel = 'strong';
                    break;
                }
                if (comparation == 'weak')
                {
                    skill.powerLevel = 'weak';
                }
            }
        }

        const reacts = [
            ':one:',
            ':two:',
            ':three:',
            ':four:'
        ];

        let i = 0;
        const battleEmbed = new YachiruEmbed()
            .setColor(isUser ? '#00FF00' : '#FF0000')
            .setTitle(isUser ? 'Agora é sua vez!' : `Vez de ${dragonName}`)
            .addField(
                `\`👤\` ${userDGName} (lvl. ${userDragon.data.level})`, 
                parseInfos(userInfos), 
                true
            )
            .addField(
                `${targetDGName} (lvl. ${targetDragon.data.level})`, 
                parseInfos(targetInfos), 
                true
            )
            .addField('SKILLS:', 
                userDragonSkills
                    .map(x => `${reacts[i++]} ${Constants.emojis[`round_${x.element}`]} **${x.name}** ${x.powerLevel == 'strong' ? '⇪' : x.powerLevel == 'weak' ? '⇩' : ''}`)
            )
            .setFooter(
                `As imagens usadas no bot são retiradas de um jogo chamado Dragon City feito pela Social Point.`,
                'https://assets.landing.jobs/attachments/companies/logos/a055894e2b46b0efdcff4f8fb934dd5df03abe5f/large.jpg?1584032796'
            );

        if (attackInfos)
        {
            battleEmbed.addField('\u200B', [
                '```',
                `${targetName} causou ${attackInfos.power}${attackInfos.powerLevel == 'strong' ? '⇪' : attackInfos.powerLevel == 'weak' ? '⇩' : ''} em ${dragonName} com seu(ua) ${attackInfos.skill.name}`,
                '```'
            ]);
        }

        return battleEmbed;
    }

    reduceHealth(amount)
    {
        this.nonCurrent.infos.health -= amount;
        return this.nonCurrent.infos.health; 
    }

    damageAmount(skill)
    {
        var { element, power } = skill;
        var randSizes = [ 0.6, 1 ];

        var nonCurrent = this.nonCurrent.infos;

        let elementPower = 'normal';
        for (let el of nonCurrent.elements)
        {
            let stuff = DragonUtils.compareElements(element, el);

            if (stuff == 'strong')
            {
                elementPower = stuff;
                break;
            }
            else if (stuff == 'weak')
            {
                elementPower = 'weak';
            }
        }   

        if (elementPower == 'strong')
        {
            randSizes = [ 0.8, 1.3 ];
        }
        else if (elementPower == 'weak')
        {
            randSizes = [ 0.4, 0.6 ];
        }

        return {
            amount: parseInt(power * (randSizes[0] + Math.random() * randSizes[1])),
            type: elementPower
        };
    }

    changeCurrent()
    {
        this.battle.currentDragon = this.ncNum;
        return this.battle.currentDragon;
    }

    get current()
    {
        return this.battle.dragons[this.battle.currentDragon];
    }

    get nonCurrent()
    {
        return this.battle.dragons[this.ncNum];
    }

    get ncNum()
    {
        return this.battle.currentDragon < 1 ? 1 : 0;
    }
}

module.exports = DragonBattle;