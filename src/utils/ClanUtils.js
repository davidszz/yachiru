module.exports = class ClanUtils
{
    static async clanExists(client, tag)
    {
        let response = await client.database.clans.findBy({ tag: tag.toLowerCase() }, '_id');
        return !!response._id;
    }

    static async userClan(client, userID)
    {
        let response = await client.database.users.findOne(userID, 'clan');
        return response.clan.id || null;
    }
}