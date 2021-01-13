const ItemsData = require('../../assets/bin/data/items.json');

const allItems = Object.values(ItemsData).flat();

const getItem = (itemId) => allItems.find(x => x.id == itemId);
const getCategory = (itemId) => Object.keys(ItemsData)
    .find(category => ItemsData[category].find(x => x.id == itemId)) || 'general';

class Inventory 
{
    constructor(player)
    {
        this.client = player.client;
        this.user = player.user;
        this.player = player;
    }

    async all(parse = false)
    {
        const data = await this.player.data('inventory');
        if (parse)
        {
            return this.parse(data.inventory);
        }

        return data.inventory;
    }

    async parse(inventory)
    {
        for (const itemId in inventory)
        {
            const infos = getItem(itemId);
            if (!infos || !infos.id) continue;

            const category = getCategory(itemId);
            inventory[itemId] = {
                infos: { 
                    category,
                    ...infos
                },
                data: inventory[itemId]
            };
        }

        return inventory;
    }
}

module.exports = Inventory;