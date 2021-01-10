const { MessageEmbed } = require('discord.js');
const DragonsData = require('../assets/bin/data/dragons.json');
const DragonUtils = require('../utils/DragonUtils');
const Constants = require('../utils/Constants');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const SPECIAL_DAMAGES = {
    'fire': [ 'plant' ],
    'earth': [ 'fire' ],
    'water': [ 'fire' ],
    'plant': [ 'earth', 'water' ]
};

const ELEMENTS_TRANSLATE = {
    'fire': 'fogo',
    'water': 'água',
    'earth': 'terra',
    'plant': 'planta'
};

const SHIELD_STRINGS = [
    'atingiu o escudo do oponente',
    'fez um ataque contra o escudo',
    'atacou o escudo'
];

const BROKEN_SHIELD_STRINGS = [
    'quebrou o escudou do oponente',
    'rachou o escudo no meio',
    'perfurou-lhe quebrando seu escudo'
];

const HP_STRINGS = [
    'fez um ataque muito forte',
    'avançou para cima do oponente',
    'atacou'
];

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
    constructor(context, dragonA, dragonB)
    {
        this.client = context.client;
        this.channel = context.channel;
        this.user = context.user;
        
        this.dragon_a = DragonBattle.parseDragon(dragonA);
        this.dragon_b = DragonBattle.parseDragon(dragonB);

        this.battle = {
            currentDragon: Math.round(Math.random()),
            dragons: [ this.dragon_a, this.dragon_b ]
        }
    }

    start()
    {
        return new Promise(async (resolve, reject) => {
            const { channel } = this;
        
            const msg = await channel.send(this.user, this.updateEmbed(`sofrerá o primeiro ataque`, 'Que começe o combate!'));   

            await delay(2500 + Math.random() * 2500);

            while (!msg.deleted)
            {
                const dragon = this.currentDragon;
                const target = this.notCurrentDragon;

                let text = '';
                let title = '';
                let special = false;

                for (let i = 0; i < dragon.elements.length; i++)
                {
                    let elements = SPECIAL_DAMAGES[dragon.elements[i]];
                    if (target.elements.some(x => elements.includes(x)))
                    {
                        let chance = Math.random();
                        if (chance >= 0.7)
                        {
                            special = true;
                            title = `causou um ataque crítico 💥 (${ELEMENTS_TRANSLATE[dragon.elements[i]].toUpperCase()})`;
                            break;
                        }
                    }
                }

                const changeText = (damageShield, damagehealth) => {
                    text = `${!this.battle.currentDragon ? 'Você causou ao inimigo' : 'Você sofreu'}:\n-${damagehealth} HP\n-${damageShield} ESCUDO\n-${damageShield + damagehealth} TOTAL`;
                };

                var damage = this.randDamage(dragon.attack, special);     
                const defense = target.defense;

                if (target.defense > 0)
                {
                    target.defense = target.defense > damage 
                        ? target.defense - damage
                        : 0;

                    this.editNotCurrent('defense', target.defense);
                    if ((defense - damage) > 0)
                    {
                        if (!special) title = SHIELD_STRINGS[Math.floor(Math.random() * SHIELD_STRINGS.length)];
                        changeText(damage, 0);
                    }
                    else 
                    {
                        if (!special) title = BROKEN_SHIELD_STRINGS[Math.floor(Math.random() * BROKEN_SHIELD_STRINGS.length)];
                        changeText(defense, (damage - defense));
                    }
                    
                    damage = defense > damage ? 0 : damage - defense;
                }
                else 
                {
                    if (!special) title = HP_STRINGS[Math.floor(Math.random() * HP_STRINGS.length)];
                    changeText(0, damage);
                }

                let health = target.health > damage 
                    ? target.health - damage
                    : 0;

                this.editNotCurrent('health', health);

                this.changeCurrent();
                await msg.edit(this.user, this.updateEmbed(title, text));

                if (!!this.checkBattleEnd())
                    break;
                await delay(4000 + Math.random() * 2500);
            }

            const winnerDrag = this.checkBattleEnd();
            msg.del();

            if (!!winnerDrag == false) {
                reject('deleted');
            }
            else
            {
                resolve(winnerDrag.owner ? true : false);
            }
        });
    }

    updateEmbed(battleTitle, battleText)
    {
        const dragons = this.battle.dragons;
        const current = this.battle.currentDragon;

        const yourDragon = dragons[0];
        const enemyDragon = dragons[1];

        const dragonName = yourDragon.nickname || yourDragon.name;

        const dragInfos = (drag) => ([
            `\`${'HP:'.padEnd(10, ' ')} ${drag.health.toString().padStart(5, ' ')}\` ${parseInt((drag.health / drag.baseHealth) * 100)}%`,
            `\`${'ESCUDO:'.padEnd(10, ' ')} ${drag.defense.toString().padStart(5, ' ')}\` (${parseInt((drag.defense / drag.baseDefense) * 100)}%)`,
            `\`${'ATAQUE:'.padEnd(10, ' ')} ${drag.attack.toString().padStart(5, ' ')}\``,
            'Elementos: ' + drag.elements.map(x => Constants.emojis[`${x}_element`]).join('')
        ]);

        const currentName = current ? this.notCurrentDragon.nickname || this.notCurrentDragon.name : `[BOT] ${this.notCurrentDragon.name}`;
        const embed = new MessageEmbed()
            .setColor(current ? '#0000FF' : '#00FF00')
            .setTitle(current ? 'Rodada do inimigo' : `${dragonName} está atacando`)
            .addField(dragonName + ` (lvl. ${yourDragon.level})`, dragInfos(yourDragon), true)
            .addField(enemyDragon.name + ` (lvl. ${enemyDragon.level})`, dragInfos(enemyDragon), true)
            .addField('\u200b', '\u200b')
            .addField(`- ${currentName} ${battleTitle}`, '```' + battleText + '```')
            .setFooter(`Esta é uma batalha da Arena nivel 1`, this.client.user.avatarIcon());

        return embed;
    }

    get currentDragon()
    {
        return this.battle.dragons[this.battle.currentDragon];
    }

    get notCurrentDragon()
    {
        return this.battle.dragons[this.battle.currentDragon == 1 ? 0 : 1];
    }

    editCurrent(key, value)
    {
        this.battle.dragons[this.battle.currentDragon][key] = value
        return this.battle.dragons[this.battle.currentDragon];
    }

    editNotCurrent(key, value)
    {
        this.battle.dragons[this.battle.currentDragon == 1 ? 0 : 1][key] = value
        return this.battle.dragons[this.battle.currentDragon == 1 ? 0 : 1];
    }

    changeCurrent()
    {
        this.battle.currentDragon = this.battle.currentDragon == 1 ? 0 : 1;
    }

    randDamage(attack, special = false)
    {
        let randPercent = (special ? 0.8 : 0.3) + Math.random() * (special ? 0.2 : 0.6);
        return parseInt(attack * randPercent);
    }

    checkBattleEnd()
    {
        if (this.currentDragon.health <= 0 && this.currentDragon.defense <= 0)
            return this.notCurrentDragon;

        if (this.notCurrentDragon.health <= 0 && this.notCurrentDragon.defense <= 0)
            return this.currentDragon;

        return false;
    }

    static parseDragon(data)
    {
        const dragon = DragonsData[data.id];
        if (!dragon) return {};

        const level = data.level || 1;
        const attack = DragonUtils.attackLevel(level, dragon.baseAttack);
        const defense = DragonUtils.defenseLevel(level, dragon.baseDefense);
        const health = DragonUtils.healthLevel(level, dragon.baseHealth);

        return ({
            ...data, 
            name: dragon.name,
            level,
            attack,
            defense,
            health,
            baseHealth: health,
            baseDefense: defense,
            elements: dragon.elements,
            icon: dragon.icons[Object.keys(dragon.icons).map(x => parseInt(x)).reduce((prev, next) => next > prev && next <= level ? next : prev, 0).toString()]
        });
    }
}

module.exports = DragonBattle;