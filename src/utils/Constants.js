module.exports = {
    emojis: {
        question: "❓",
        previous: "⬅️",
        next: "➡️",
        fire_element: "<:fire_element:797350358338371645>",
        water_element: "<:water_element:797350855635632129>",
        earth_element: "<:earth_element:797350855778107413>",
        plant_element: "<:plant_element:797350855733018655>",
        round_fisic: '<:round_fisic:798684106702979102>',
        round_fire: '<:round_fire:798654260149223464>',
        round_water: '<:round_water:798654260208205834>',
        round_earth: '<:round_earth:798654259960741939>',
        round_plant: '<:round_plant:798654260211613696>',
        round_ice: "<:round_ice:799125111256383558>",
        fire_egg: "<:fire_egg:792571716731797524>",
        huge_farm: "<:big_farm:792881826615263302>",
        structures: "🏭"
    },
    reaction: (name) => module.exports.emojis[name] 
        ? module.exports.parseEmoji(module.exports.emojis[name])
        : null,
    parseEmoji: (emoji) => emoji.replace(/[<>]/g, '').split(':').pop()
}