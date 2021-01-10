const Badges = require('../assets/bin/data/badges.json');
const Jobs = require('../assets/bin/data/jobs.json');

module.exports = class FlagUtils
{
    static getBadge(id)
    {
        return Badges[id] || null;
    }

    static parseBadges(user, data)
    {
        data = Array.isArray(data) ? data : [];

        const userFlags = user.flags ? user.flags.toArray() : [];
        if (userFlags.includes('HOUSE_BRILLIANCE')) 
        {
            data.push('4');
        }
        if (userFlags.includes('HOUSE_BALANCE')) 
        {
            data.push('5');
        }
        if (userFlags.includes('HOUSE_BRAVERY')) 
        {
            data.push('6');
        }

        const badges = data
            .sort((a, b) => Number(a) - Number(b))
            .filter((id, index) => Badges[id] && data.indexOf(id) === index)
            .map(id => Badges[id]);

        return badges;
    }

    static getJob(id)
    {
        return Jobs[id] || null;
    }
}