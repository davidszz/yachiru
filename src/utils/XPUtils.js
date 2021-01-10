module.exports = class XPUtils
{
    static async addXp(client, userId, amount = 0)
    {
        if (!amount) return;

        const user = client.users.cache.get(userId) ||
            await client.users.fetch(userId).catch(() => null);

        if (!user) return;

        const data = await client.database.users.findOne(userId, 'level xp');

        let userXp = data.xp || 0;
        let userLevel = data.level || 1;    
        
        let needsXp = XPUtils.needsXp(data.level);
        let calcXp = userXp + amount;

        if (calcXp >= needsXp)
        {
            let remainingXp = calcXp - needsXp;
            let newLevel = userLevel + 1;

            needsXp = XPUtils.needsXp(newLevel);
            while (remainingXp >= needsXp)
            {
                newLevel++;
                remainingXp = remainingXp - needsXp;
                needsXp = XPUtils.needsXp(newLevel);
            }

            await client.database.users.update(userId, {
                level: newLevel,
                xp: remainingXp
            });
            
            let oldInfos = { xp: userXp, level: userLevel };
            let newInfos = { xp: remainingXp, level: newLevel };

            client.emit('userLevelUp', user, oldInfos, newInfos);
            client.emit('userXpUpdate', user, userXp, calcXp);

            return ({ old: oldInfos, new: newInfos });
        }
        else 
        {
            await client.database.users.update(userId, {
                xp: calcXp
            });

            client.emit('userXpUpdate', user, userXp, calcXp);

            let oldInfos = { xp: userXp, level: userLevel };
            let newInfos = { xp: calcXp, level: userLevel };

            return ({ old: oldInfos, new: newInfos });
        }
    }

    static needsXp(level)
    {
        return level <= 0 ? 0 : (5 * Math.pow(level, 2) + 50 * level + 100);
    }

    static updateXpJson(xp, level)
    {
        if (xp < XPUtils.needsXp(level))
            return ({ xp });

        let remaining = xp;
        while (remaining >= XPUtils.needsXp(level))
        {
            remaining -= XPUtils.needsXp(level);
            level++;
        }

        return ({ xp: remaining, level });
    }

    static levelMoneyReward(level)
    {
        return level <= 1 ? 0 : (2 * Math.pow(level, 2) + 10 * level + 20);
    }
}