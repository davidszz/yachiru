const { Command, DragonUtils, MiscUtils } = require('../../');
const { formatNumber } = MiscUtils;

module.exports = class extends Command 
{
    constructor(...args)
    {
        super(...args, {
            name: 'alimentar',
            aliases: [ 'feed' ],
            category: 'RPG',
            description: 'Alimente um de seus dragões.',
            usage: '<id> max',
            examples: [
                '1'
            ],
            parameters: [
                {
                    type: 'string',
                    required: true,
                    validate: (val) => /^\d+$/.test(val) && Number(val) > 0,
                    errors: {
                        validate: 'Forneça um **id** válido acima de **0** contendo apenas números.'
                    }
                },
                {
                    type: 'string',
                    validate: (val) => ['max', 'máximo', 'maximo'].includes(val.toLowerCase()),
                    errors: {
                        validate: 'O último argumento deve ser **max** caso queira alimentar o seu dragão até o máximo.'
                    }
                }
            ]
        });
    }

    async run(message, [ id, max ])
    {
        const { author } = message;

        const userdata = await this.client.database.users.findOne(author.id, 'temples dragonFood dragons');

        const idx = Number(id) - 1;
        const dragon = userdata.dragons[idx];

        if (!dragon)
        {
            return message.reply(`nenhum dragão com esse **id** foi encontrado.`);
        }

        const food = userdata.dragonFood;
        const temples = userdata.temples;
        const maxLevel = DragonUtils.highLevelTemple(temples);
        const infos = this.client.dragons.get(dragon.id);

        if (dragon.level >= 70)
        {
            return message.reply(`seu dragão já atingiu o nível **máximo**.`);
        }

        if (dragon.level >= maxLevel)
        {
            return message.reply(`seu dragão já alcançou o nível **${maxLevel}**. Você não possui **templos** para upar acima de nível.`);
        }

        const needsFood = DragonUtils.nextFood(dragon.level);
        if (food < needsFood)
        {
            return message.reply(`você não possui **${formatNumber(needsFood)} 🍒** para alimentar seu dragão.`);
        }

        if (max)
        {
            let food_ = food;
            let newLevel = false;

            while (food_ >= DragonUtils.nextFood(dragon.level)
                && dragon.level < maxLevel
                && dragon.level < 70)
            {
                const needsFood = DragonUtils.nextFood(dragon.level);
                if (dragon.foodStep == null)
                {
                    dragon.foodStep = 0;
                }

                if (dragon.foodStep >= 3)
                {
                    dragon.foodStep = 0;
                    dragon.level++;
                    newLevel = true;
                }
                else
                {
                    dragon.foodStep++;
                }

                food_ -= needsFood;
            }

            userdata.dragons[idx] = dragon;
            await this.client.database.users.update(author.id, {
                dragons: userdata.dragons,
                dragonFood: food_
            });

            if (newLevel)
            {
                return message.reply(`você alimentou seu dragão com **${formatNumber(food - food_)} 🍒** e upou ele para o nível **${dragon.level}**!`);
            }
            
            return message.reply(`você alimentou seu dragão com **${formatNumber(food - food_)} 🍒**.`);
        }

        if (dragon.foodStep == null)
        {
            dragon.foodStep = 0;
        }

        let newLevel = false;
        if (dragon.foodStep >= 3)
        {
            dragon.foodStep = 0;
            dragon.level++;
            newLevel = true;
        }
        else 
        {
            dragon.foodStep++;
        }

        userdata.dragons[idx] = dragon;
        
        await this.client.database.users.update(author.id, {
            dragons: userdata.dragons,
            $inc: {
                dragonFood: -needsFood
            }
        });

        if (newLevel)
        {
            return message.reply(`você alimentou seu dragão com **${formatNumber(needsFood)} 🍒** e ele upou para o nível **${dragon.level}**.`);
        }
        else 
        {
            return message.reply(`você deu **${formatNumber(needsFood)} 🍒** para seu dragão. (${dragon.foodStep}/4)`);
        }


    }
}