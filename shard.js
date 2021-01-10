require('dotenv').config();

const Discord = require('discord.js');
const options = {
    token: process.env.DISCORD_TOKEN,
    totalShards: parseInt(process.env.SHARD_COUNT) || 'auto'
};

const manager = new Discord.ShardingManager('./index.js', options);

manager.spawn();
manager.on('shardCreate', (shard) => console.log(`Launching shard ${shard.id}`));