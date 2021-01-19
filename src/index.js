module.exports = {
    // Lang
    Lang: require('./lang/pt-BR.json'),

    // Utilities
    Utils: require('./utils/index'),
    FileUtils: require('./utils/FileUtils'),
    MiscUtils: require('./utils/MiscUtils'),
    XPUtils: require('./utils/XPUtils'),
    CanvasTemplates: require('./utils/CanvasTemplates'),
    FlagUtils: require('./utils/FlagUtils'),
    Constants: require('./utils/Constants'),
    ClanUtils: require('./utils/ClanUtils'),
    DragonUtils: require('./utils/DragonUtils'),
    ArenaUtils: require('./utils/ArenaUtils'),
    MercadoPagoUtils: require('./utils/MercadoPagoUtils'),

    // Structures
    Loader: require('./structures/Loader'),
    Command: require('./structures/Command'),
    EventListener: require('./structures/EventListener'),
    DragonBattle: require('./structures/DragonBattle'),
    CommandError: require('./structures/CommandError'),
    Player: require('./structures/Player'),
    PlayerManager: require('./structures/PlayerManager'),
    YachiruEmbed: require('./structures/YachiruEmbed'),
    ItemManager: require('./structures/ItemManager'),
    DragonsManager: require('./structures/DragonsManager'),
    MercadoPago: require('./structures/MercadoPago'),

    // Data [BIN FILES]
    DragonsData: require('./assets/bin/data/dragons.json'),
    BadgesData: require('./assets/bin/data/badges.json'),
    ItemsData: require('./assets/bin/data/items.json'),
    ElementsData: require('./assets/bin/data/elements.json')
}