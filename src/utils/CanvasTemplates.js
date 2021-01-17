const FlagUtils = require('./FlagUtils');
const Backgrounds = require('../assets/bin/data/backgrounds.json');
const Borders = require('../assets/bin/data/borders.json');
const MiscUtils = require('./MiscUtils');

var Canvas = {};
try 
{
    Canvas = require('canvas');
}
catch(err)
{
    // nothing
}

const { createCanvas, loadImage } = Canvas;

module.exports = class CanvasTemplates
{
    /**
     * Create a canvas image with user infos
     * @param {User} user - The user
     * @param {Object} userDocument - The user document with infos
     */
    static async profile(user, userDocument)
    {
        const width = 585;
        const height = 345;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingQuality = 'low';

        const fonts = {
            username: 'bold 18px "Poppins", "Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif',
            discriminator: '14px "Poppins Light"',
            level: 'bold 11px "Friz Quadrata"',
            infosTitle: 'bold 16px "Poppins"',
            infosDesc: '16px "Poppins"',
            xp: '13px "Poppins Medium"',
            rank: '16px "Poppins Medium"',
            personalText: '13px "Poppins", "Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif'
        };

        var lightTheme = (value, def) => userDocument.lightTheme ? value : def;

        const icons = {
            xp: await loadImage(lightTheme('src/assets/icons/xp-icon.png', 'src/assets/icons/xp-icon-light.png')),
            rank: await loadImage(lightTheme('src/assets/icons/rank-icon.png', 'src/assets/icons/rank-icon-light.png')),
            personalText: await loadImage('src/assets/icons/personal-text-icon.png')
        };

        const colors = {
            username: lightTheme('#23272A', '#FFF'),
            discriminator: lightTheme('#2C2F33', '#777'),
            personalText: '#828282',
            background: lightTheme('#f0f0f0', '#010A13'),
            line: lightTheme('#d0d0d0', '#252B2F'),
            level: '#FFF',
            infosTitle: '#917F58',
            infosDesc: '#5A523E',
            xpCircleBg: lightTheme('rgba(0,0,0,.5)', 'rgba(255,255,255,.5)'),
            xpCircle: 'rgba(255,255,255,.5)',   
            xp: lightTheme('#2C2F33', '#FFF'),
            rank: lightTheme('#2C2F33', '#FFF'),
            clanTag: lightTheme('#5A523E', '#dedede')
        };

        var { level, xp, money, badges, background, personalText, nextLevelXp, rank, dragons, food, border = 1, clanTag } = userDocument;
        var username = user.username;
        var discriminator = `#${user.discriminator}`;
        var avatar = await loadImage(user.displayAvatarURL({ format: 'png', size: 128 }));
        
        badges = FlagUtils.parseBadges(user, badges);
        for (const index in badges)
        {
            badges[index] = await loadImage(badges[index].icon);
        }

        if (background == 1 || background == 2)
        {
            background = lightTheme(2, 1);
        }
        background = Backgrounds[background] || Backgrounds[1];
        background = await loadImage(background.src);

        colors.xpCircle = Borders[border].color;
        border = await loadImage(Borders[border].src);

        personalText = personalText ? personalText
            : `Use ${user.client.prefix}sobre <frase> para alterar esta frase.`;
        personalText = `"${personalText}"`;

        // Background image cover
        ctx.fillStyle = '#404040';
        ctx.fillRect(0, 0, width, 120);
        // Background image
        var imgHeight = (width / background.width) * background.height;
        ctx.drawImage(background, 0, 0, width, imgHeight);
        // Background content (dark grey)
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 120, width, height - 120);
        // Background line on top content
        ctx.fillStyle = colors.line;
        ctx.fillRect(0, 119, width, 2);

        // User avatar
        ctx.roundImage(avatar, 40, 93, 90);
        // Level border BG
        ctx.beginPath();
        ctx.strokeStyle = colors.xpCircleBg;
        ctx.lineWidth = 5;
        ctx.progressCircle(85, 138, 47, 100);
        ctx.stroke();
        ctx.closePath();
        // Level border
        ctx.beginPath();
        ctx.strokeStyle = colors.xpCircle;
        ctx.lineWidth = 5;
        ctx.progressCircle(85, 138, 47, (xp / nextLevelXp) * 100);
        ctx.stroke();
        ctx.closePath();
        // Border   
        ctx.roundImage(border, 5, 58, 160);

        // User level
        ctx.fillStyle = colors.level;
        ctx.font = fonts.level;
        ctx.textAlign = 'center';
        ctx.fillText(level, 84.7, 190);

        // Clan Tag
        ctx.fillStyle = colors.clanTag;
        ctx.font = fonts.username;
        ctx.textAlign = 'left';
        if (clanTag)
        {
            ctx.fillText(`[${clanTag}]`, 180, 155);
            var clanTagMeasure = ctx.measureText(`[${clanTag}]`);
        }
        // User name
        ctx.fillStyle = colors.username;
        ctx.fillText(username, clanTag && clanTagMeasure ? (182 + clanTagMeasure.width) : 182, 155);
        // Discriminator
        let measure = ctx.measureText(username);
        ctx.font = fonts.discriminator;
        ctx.fillStyle = colors.discriminator;
        ctx.fillText(discriminator, (clanTag && clanTagMeasure ? (184 + clanTagMeasure.width) : 184) + measure.width, 155);

        // User badges
        let badgePosX = 180;
        let badgePosY = 165;
        for (let badge of badges)
        {
            let _width = (25 / badge.height) * badge.width;
            ctx.drawImage(badge, badgePosX, badgePosY, _width, 25);
            
            if (badgePosX >= (width - 100))
            {
                badgePosX = 180;
                badgePosY += 32.5;
            }
            else 
            {
                badgePosX += 32.5;
            }
        }

        // Rank
        // Icon:
        ctx.drawImage(icons.rank, 17, 17, icons.rank.width, icons.rank.height);
        // Text:
        ctx.fillStyle = colors.rank;
        ctx.font = fonts.rank;
        ctx.fillText(`#${rank}`, 35, 31);

        // XP
        ctx.font = fonts.xp;
        ctx.fillStyle = colors.xp;
        ctx.textAlign = 'right';
        const xpText = `${xp}/${nextLevelXp}`;
        const measureXp = ctx.measureText(xpText);
        // Icon:
        ctx.drawImage(icons.xp, (width - 62) - measureXp.width, 17, icons.xp.width, icons.xp.height);
        // Text:
        ctx.fillText(xpText, width - 20, 29);

        // Infos Titles
        ctx.font = fonts.infosTitle;
        ctx.fillStyle = colors.infosTitle;
        ctx.textAlign = 'center';
        // Money:
        ctx.fillText('DINHEIRO:', 90, 265);
        // Food:
        ctx.fillText('COMIDA:', width / 2, 265);
        // Dragons:
        ctx.fillText('DRAGÕES:', width - 90, 265);

        // Infos Descriptions
        ctx.font = fonts.infosDesc;
        ctx.fillStyle = colors.infosDesc;
        // Money:
        ctx.fillText(money, 90, 285);
        // Food:
        ctx.fillText(MiscUtils.shortNumber(food, 3, ','), width / 2, 285);
        // Dragons:
        ctx.fillText(dragons, width - 90, 285);

        // Personal Text
        // Line:
        ctx.fillStyle = colors.line;
        ctx.fillRect(0, height - 32, width, 1.5);
        // Icon:
        ctx.drawImage(icons.personalText, 29, height - 22, icons.personalText.width * .32, icons.personalText.height * .32);
        // Text:
        ctx.fillStyle = colors.personalText;
        ctx.font = fonts.personalText;
        ctx.textAlign = 'left';
        
        while (ctx.measureText(personalText).width > (width - 85))
        {
            personalText = personalText.slice(0, -1);
        }

        if (!personalText.endsWith('"')) personalText += '"';
        ctx.fillText(personalText, 60, height - 11);

        return canvas.toBuffer();
    }

    /**
     * Create a dragon infos image
     * @param {Object} infos - The dragon infos
     */
    static async dragonInfos(infos)
    {
        try 
        {
            const width = 680;
            const height = 435;

            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            ctx.imageSmoothingQuality = 'low';

            const fonts = {
                level: 'bold 57px "Open Sans"',
                nickname: 'bold 20px "Open Sans"',
                name: 'bold 16px "Open Sans"',
                infos: 'bold 10px "Open Sans"',
                gold: 'bold 20px "Roboto"',
                food: '20px "Poetsen One"',
                health: 'bold 20px "Roboto"',
                description: '10px "Montserrat Light"'
            };

            const colors = {
                level: '#f6ff00',
                nickname: 'black',
                name: 'white',
                health: 'white',
                infos: 'white',
                gold: 'white',
                food: 'black',
                description: 'white'
            }

            // Informations
            var { name, nickname, level, dragonImage, food, gold, elements, health, skills, description } = infos;

            // Background
            const background = await loadImage('src/assets/images/dragon-info-bg.png');
            ctx.drawImage(background, 0, 0);

            // Dragon Image
            let dgImageX = 0;
            let dgImageY = 0;
            if (dragonImage.endsWith('1.png'))
            {
                dgImageX = 150;
                dgImageY = 240;
            }
            else
            {
                dgImageX = 46;
                dgImageY = 134;
            }
            
            dragonImage = await loadImage(dragonImage);
        
            ctx.drawImage(dragonImage, dgImageX, dgImageY);

            // Draw level
            ctx.font = fonts.level;
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillText(level, 65, height - 53);
            ctx.fillStyle = colors.level;
            ctx.fillText(level, 65, height - 55);

            // Dragon name tag
            if (nickname)
            {
                const woodenPlaceholder = await loadImage('src/assets/images/wooden-placeholder.png');
                ctx.drawImage(woodenPlaceholder, 0, 0);
                ctx.font = fonts.nickname;
                ctx.fillStyle = colors.nickname;
                ctx.shadowColor = 'transparent';
                ctx.fillText(nickname, 135, 123);
            }

            // Dragon elements
            let elementXPos = 32 + (elements.length * 14);           
            for (let element of elements)
            {
                let image = await loadImage(element);
                ctx.drawImage(image, width - elementXPos, 21, 9, 20);
                elementXPos -= 14;
            }

            // Dragon Name
            ctx.font = fonts.name;
            let nameLines = ctx.getTextLines(name.toUpperCase(), 155);
            ctx.textAlign = 'left';
            ctx.fillStyle = colors.name;
            
            let nameY = 66;
            for (let line of nameLines)
            {
                ctx.fillText(line, width - 195, nameY);
                nameY += 19;
            }

            // Dragon Description
            ctx.font = fonts.description;
            ctx.fillStyle = colors.description;
            let descriptionLines = ctx.getTextLines(description || 'Sem descrição.', 160);
            
            let descX = width - 195;
            let descY = 126;
            let descLineHeight = 12;
            
            for (let line of descriptionLines)
            {
                ctx.fillText(line, descX, descY);
                descY += descLineHeight;
            }

            // Dragon Infos
            health = MiscUtils.formatNumber(health, ',');
            ctx.font = fonts.infos;
            ctx.fillStyle = colors.infos;
            /* Skills */
            let skillsPosY = 263;
            ctx.filter = 'contrast(1.4) sepia(1)';
            for (let skill of skills)
            {
                let img = await loadImage('src/assets/images/round_' + skill.element + '.png');
                ctx.drawImage(img, width - 195, skillsPosY - 17, img.width / 2.5, img.height / 2.5)
                if (skill.level && skill.level > level)
                    ctx.fillStyle = '#FF0000';
                ctx.fillText(skill.level && skill.level > level ? `DESBLOQUEIA LVL ${skill.level}` : skill.name.toUpperCase(0), width - 170, skillsPosY - 5);
                if (skill.level && skill.level > level)
                    ctx.fillStyle = '#FFFFFF';

                skillsPosY += 22;
            }
            /* Health */
            ctx.textAlign = 'right';
            ctx.font = fonts.health;
            ctx.fillStyle = colors.health;
            ctx.fillText(health, 308, 54)
            ctx.textAlign = 'left';

            // Gold by minute
            gold = MiscUtils.formatCurrency(gold);
            ctx.font = fonts.gold;
            ctx.fillStyle = colors.gold;
            ctx.fillText(gold, width - 140, height - 70);

            // Food
            food = MiscUtils.shortNumber(food, 1);
            ctx.font = fonts.food;
            ctx.fillStyle = colors.food;
            ctx.textAlign = 'right';
            ctx.fillText(food, width - 255, height - 36);

            return canvas.toBuffer();
        }
        catch(err)
        {
            console.log(err);
        }
    }

    static async temples(temples)
    {
        const width = 500;
        const height = 300;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        let count = 0;
        let x = 58, y = 40;

        let background = await loadImage('src/assets/images/temples-background.png');
        ctx.drawImage(background, 0, 0);

        for (let temple of temples)
        {
            if (count >= 3)
            {
                y += 130;
                x = 58;
            }

            console.log(x);;
            let image = await loadImage(temple);
            ctx.drawImage(image, x, y, 0.3 * image.width, 0.3 * image.height);

            x += 155.5;
            count++;
        }
        return canvas.toBuffer();
    }
}