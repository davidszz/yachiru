const ItemManager = require('./ItemManager');

class DragonsManager extends ItemManager
{
    constructor(client, dragons)
    {
        super(client, dragons);
    }
}

module.exports = DragonsManager;