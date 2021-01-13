const ElementsData = require('../assets/bin/data/elements.json');

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

    static goldMinute(level, baseGold)
    {
        return level < 5 ? baseGold : baseGold * Math.floor(level / 5);
    }

    static getTotalGold(time, baseGold, level)
    {
        return parseInt((Date.now() - time) / 60000) * DragonUtils.goldMinute(level, baseGold);
    }

    static parseSkills(dragonSkills, level)
    {
        let parsedSkills = [
            {
                name: 'Soco',
                element: 'fisic',
                power: DragonUtils.attackLevel(level, 68)
            }
        ];

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