module.exports = class ArenaUtils
{
    static goldPrize(level, wins)
    {
        let battle = ArenaUtils.nextBattleNum(wins + 1);

        let prize = level * 1000;
        if (battle == 0)
        {
            prize *= 10;
        }

        return prize;
    }

    static xpPrize(level, wins)
    {
        let battle = ArenaUtils.nextBattleNum(wins + 1);

        let prize = level * 50;
        if (battle == 0)
        {
            prize *= 5;
        }

        return prize;
    }

    static nextBattleNum(wins)
    {
        return parseInt(wins % 10);
    }
}