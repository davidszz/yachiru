module.exports = {
    emojis: {
        question: "❓",
        previous: "⬅️",
        next: "➡️",
        fire_element: "<:fire_element:797350358338371645>",
        water_element: "<:water_element:797350855635632129>",
        earth_element: "<:earth_element:797350855778107413>",
        plant_element: "<:plant_element:797350855733018655>",
        fire_egg: "<:fire_egg:792571716731797524>",
        huge_farm: "<:big_farm:792881826615263302>",
        structures: "🏭"
    },
    reaction: (name) => module.exports.emojis[name] 
        ? module.exports.parseEmoji(module.exports.emojis[name])
        : null,
    parseEmoji: (emoji) => emoji.replace(/[<>]/g, '').split(':').pop()
}