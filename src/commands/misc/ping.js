const { Command } = require('../../');

module.exports = class extends Command
{
    constructor(...args)
    {
        super(...args, {
            name: 'ping',
            aliases: [ 'ms', 'shards' ],
            description: 'Obtem dados sobre a conexão de rede do bot.'
        });
    }

    async run({ channel }, args)
    {   
        const pEnd = (text, amount) => text.padEnd(amount, ' ');
        const shards = [
            '\`' + pEnd('ID:', 6) + pEnd('GUILDS:', 8) + pEnd('LATÊNCIA:', 10) + '\`'
        ];

        const guildCount = await this.client.shard.fetchClientValues('guilds.cache.size');
        const ping = await this.client.shard.fetchClientValues('ws.ping');

        guildCount.forEach((count, shardId) => {
            let strShard = `\``;
            strShard += pEnd(shardId.toString(), 6);
            strShard += pEnd(count.toString(), 8);
            strShard += pEnd(ping[shardId].toString() + ' ms', 10);
            strShard += `\``;

            shards.push(strShard);
        });
        channel.send(shards.join('\n'));
    }
}