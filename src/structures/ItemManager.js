class ItemManager
{
    constructor(client, items)
    {
        this.client = client;
        this.items = items;
    }

    get(id)
    {
        return this.items[id] ? { id, ...(this.items[id]) } : null;
    }

    get categories()
    {
        const categories = {};
        const items = this.parse();

        for (const id in items)
        {
            const item = items[id];

            if (!categories[item.category])
            {
                categories[item.category] = 0;
            }

            categories[item.category]++;
        }

        return categories;
    }

    filter(cursor)
    {
        const items = this.parse();
        return Object.values(items).filter(cursor) || [];
    }

    findByType(type)
    {
        return this.filter(x => x.type.toLowerCase() == type.toLowerCase());
    }

    getCategoryItems(category)
    {
        return this.filter(x => x.category.toLowerCase() == category.toLowerCase());
    }

    find(cursor)
    {
        const items = this.parse();
        return Object.values(items).find(cursor) || null;
    }

    parse(items = this.items)
    {
        const parsed = Object.fromEntries(
            Object.entries(items)
                .map(x => {
                    x[1] = { id: x[0], ...x[1] };
                    return x;
                })
        );

        return parsed;
    }
}

module.exports = ItemManager;