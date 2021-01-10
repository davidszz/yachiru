const { Message, Guild, ReactionEmoji, User } = require('discord.js');
// const { Api } = require('../../');

Message.prototype.del = function(options)
{
    if (typeof options !== 'object')
    {
        return this.delete({ timeout: (options || 0) })
            .catch(e => e);
    }

    return this.delete(options)
        .catch(e => e);
}

// Message.prototype.react = async function(emoji)
// {            
//     if (emoji.includes('<:'))
//     {
//         emoji = emoji.replace(/<:[^]+:/g, '').replace('>', '');
//     }

//     if (emoji instanceof ReactionEmoji)
//     {
//         emoji = emoji.identifier;
//     }
//     else if (typeof emoji === 'string')
//     {
//         let resolvable = this.client.emojis.cache.get(emoji);
//         if (resolvable)
//         {
//             emoji = resolvable.identifier;
//         }
//         else 
//         {
//             if (!emoji.includes('%'))
//             {
//                 emoji = encodeURIComponent(emoji);
//             }
//         }
//     }

//     return new Promise(async (resolve, reject) => {
//         const react = async () => {
//             let response = await Api.request(`channels/${this.channel.id}/messages/${this.id}/reactions/${emoji}/@me`, {
//                 method: 'put'
//             }).catch(e => e);

//             await (new Promise(resolve => setTimeout(resolve, 200)));
//             return response;
//         };

//         let response = await react();
//         while(response.retry_after)
//         {
//             response = await react();
//         }

//         resolve(this.reactions.cache.find(e => (emoji ? e._emoji.identifier === emoji || encodeURIComponent(e._emoji.identifier) === emoji : e._emoji.id === emoji || e._emoji.name === emoji)) || {});
//     });
// }

Guild.prototype.iconUri = function()
{
    return this.iconURL({ format: 'jpg', dynamic: true });
}

User.prototype.avatarIcon = function()
{
    return this.avatarURL({ format: 'jpg', dynamic: true });
}