const MessageEmbed = require('discord.js').MessageEmbed;

class YachiruEmbed extends MessageEmbed 
{
    constructor(user, data = {})
    {
        super(data);

        this.setColor('#FFAAFF');
        this.setTimestamp();

        if (user)
        {
            this.setFooter(user.tag, user.avatarIcon())
        }
    }

    addDescription(text)
    {
        this.setDescription([
            this.description || '',
            Array.isArray(text) ? text.join('\n') : text
        ]);

        return this;
    }
}

module.exports = YachiruEmbed;