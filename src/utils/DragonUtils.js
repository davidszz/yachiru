const ElementsData = require('../assets/bin/data/elements.json');
const DragonsData = require('../assets/bin/data/dragons.json');
const ItemsData = require('../assets/bin/data/items.json');

module.exports = class DragonUtils
{
    static nextFood(level)
    {
        let total = 5;
        for (let i = 1; i < level; i++)
        {
            if (i < 9)
                total *= 2;
            else if (i < 19)
                total *= 1.3;
            else if (i < 39)
                total *= 1.2;
            else if (i < 59)
                total *= 1.1;
            else if (i < 69)
                total *= 1.05;
        }

        return Math.round(total);
    }

    static attackLevel(level, attack)
    {
        return level <= 1 ? attack : attack + Math.pow(level, 2);
    }

    static defenseLevel(level, baseDefense)
    {
        return level <= 1 ? baseDefense : baseDefense + (Math.pow(level, 2));
    }

    static healthLevel(level, baseHealth)
    {
        return level <= 1 ? baseHealth : (15 * (Math.pow(level, 2)) + baseHealth);
    }

    static damageSize(element, defenseElement)
    {
        let damage = 1;

        if (defenseElement == element)
            damage = 0;
        else
        {
            let strongElements = ElementsData[element];
            if (strongElements.includes(defenseElement))
                damage = 2;
            else 
            {
                let weakElements = ElementsData[defenseElement];
                if (weakElements.includes(element))
                    damage = .5;
            }
        }

        return damage;
    }

    static goldMinute(level, dragonId)
    {
        var dragon = DragonsData[dragonId];
        var gold = dragon.baseGold;
        
        if (level > 10)
        {
            for (let i = 0; i < 10; i++)
                gold += dragon.levelGold;

            for (let i = 9; i < level; i++)
                gold += (dragon.levelGold / 2);
        }
        else 
        {
            gold += (dragon.levelGold * level);
        }

        gold -= dragon.levelGold;
        return gold;
    }

    static totalGold(data)
    {
        const computed = Date.now() - data.lastCollectedGold;
        const gold = DragonUtils.goldMinute(data.level || 1, data.id);

        const times = Math.floor(computed / 60000);
        const infos = DragonsData[data.id];
        const max = infos.maxGold ? infos.maxGold : (720 * gold);

        return times * gold > max ? max : times * gold;
    }

    static highLevelTemple(temples)
    {
        let highLevel = 10;
        for (const temple of temples)
        {
            const infos = ItemsData[temple.id];
            if (!infos) continue;

            const level = infos.maxDragonLevel || 0;
            if (level > highLevel)
            {
                highLevel = level;
            }
        }

        return highLevel;
    }

    static parseSkills(dragonSkills, level)
    {
        let parsedSkills = [];

        for (let skills of dragonSkills)
        {
            skills.power = DragonUtils.attackLevel(level, skills.power);
            parsedSkills.push(skills);
        }

        return parsedSkills;
    }

    static compareElements(elementA, elementB)
    {
        let infosA = ElementsData[elementA];
        let infosB = ElementsData[elementB];

        if (infosA.includes(elementB))
        {
            return 'strong';
        }
        
        if (infosB.includes(elementA))
        {
            return 'weak';
        }

        return 'normal';
    }
}