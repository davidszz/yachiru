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

    static attackLevel(level, baseAttack)
    {
        return level <= 1 ? baseAttack : baseAttack + Math.pow(level, 2);
    }

    static defenseLevel(level, baseDefense)
    {
        return level <= 1 ? baseDefense : baseDefense + (Math.pow(level, 2));
    }

    static healthLevel(level, baseHealth)
    {
        return level <= 1 ? baseHealth : (3 * (Math.pow(level, 2)) + baseHealth);
    }

    static goldMinute(level, baseGold)
    {
        return level < 5 ? baseGold : baseGold * Math.floor(level / 5);
    }

    static getTotalGold(time, baseGold, level)
    {
        return parseInt((Date.now() - time) / 60000) * DragonUtils.goldMinute(level, baseGold);
    }
}