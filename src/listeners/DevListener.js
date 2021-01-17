const { EventListener, ClanUtils, MiscUtils, DragonBattle } = require('../');
const CanvasUtils = require('../utils/CanvasUtils');

const sasuke = '757379507358531675';
const soulSociety = '785206533180751902';

module.exports = class DevListener extends EventListener
{
    constructor(client)
    {
        super({
            events: [ 'ready', 'loaded' ]
        }, client);
    }

    async onLoaded()
    {
    }

    async onReady()
    {
        // const sasukeDrag = {
        //     id: '0001',
        //     nickname: 'Foguinho',
        //     level: 9
        // };

        // const targetDrag = {
        //     id: '0004',
        //     level: 10,
        //     owner: sasuke
        // };

        const channel = this.channels.cache.get('796832689352081428');
        channel.bulkDelete(100);
        // const user = this.users.cache.get(sasuke);

        // const battle = new DragonBattle({ channel, user, client: this }, sasukeDrag, targetDrag);
        // battle.start()
        //     .then((win) => {
        //         if (win)
        //         {
        //             channel.send('Você ganhou');
        //         }
        //         else 
        //         {
        //             channel.send('Você perdeu');
        //         }
        //     })
        //     .catch(() => {
        //         channel.send('Sua batalha foi cancelada devido a mensagem ter sido deletada enquanto a batalha ocorria.');
        //     });
    }
}