const MessageEmbed = require('discord.js').MessageEmbed;

class YachiruEmbed extends MessageEmbed 
{
    constructor(data)
    {
        super(data);
        
        this.setColor('#FFAAFF');
    }
}

module.exports = YachiruEmbed;