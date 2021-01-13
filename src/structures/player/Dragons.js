const DragonUtils = require('../../utils/DragonUtils');

class Dragons 
{
    constructor(player)
    {
        this.client = player.client;
        this.player = player;
    }

    async all(parse = false)
    {
        const data = await this.player.data('dragons equippedDragon');
        const dragons = data.dragons;
        if (data.equippedDragon != null && dragons[data.equippedDragon])
        {
            dragons[data.equippedDragon].equipped = true;
        }

        if (parse)
        {
            return this.parse(dragons);
        }

        return dragons;
    }

    async parse(dragons)
    {
        const path = '../../assets/bin/data/dragons.json';
        delete require.cache[require.resolve(path)];
        const DragonsData = require(path);

        const parsedDragons = [];
        for (const dragon of dragons)
        {
            const infos = DragonsData[dragon.id];
            if (!infos || !infos.name)
            {
                parsedDragons.push(dragon);
                continue;
            }

            const level = dragon.level || 1;

            const health = DragonUtils.healthLevel(level, infos.baseHealth);
            const goldMinute = DragonUtils.goldMinute(level, infos.baseGold);
            const totalGold = DragonUtils.getTotalGold(dragon.lastCollectedGold, infos.baseGold, level);
            const nextFood = DragonUtils.nextFood(level);
            const skills = DragonUtils.parseSkills(infos.skills, level);

            const drag = {
                infos: {
                    ...infos,
                    health, goldMinute, totalGold, nextFood, skills
                },
                data: { ...dragon, level }
            };

            parsedDragons.push(drag);
        }

        return parsedDragons;
    }

    async equipped()
    {
        var dragons = await this.all(true);
        var equipped = null;

        for (let dragon of dragons)
        {
            if (dragon.data.equipped)
                equipped = dragon;
        }

        return equipped;
    }
}

module.exports = Dragons;