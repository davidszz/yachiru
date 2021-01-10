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
            personalText: '13px "Poppins"'
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

        var { level, xp, money, badges, background, job, personalText, nextLevelXp, rank, border = 1, clan = 'Nenhum', clanTag } = userDocument;
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
        // Job:
        ctx.fillText('TRABALHO:', width / 2, 265);
        // Clan:
        ctx.fillText('CLÃ ATUAL:', width - 90, 265);

        // Infos Descriptions
        ctx.font = fonts.infosDesc;
        ctx.fillStyle = colors.infosDesc;
        // Money:
        ctx.fillText(money, 90, 285);
        // Job:
        ctx.fillText(job, width / 2, 285);
        // Clan:
        ctx.fillText(clan, width - 90, 285);

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
            const width = 860;
            const height = 550;

            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            ctx.imageSmoothingQuality = 'low';

            const fonts = {
                level: 'bold 72px "Open Sans"',
                nickname: 'bold 20px "Open Sans"',
                name: 'bold 20px "Open Sans"',
                infos: 'bold 22px "Roboto"',
                gold: 'bold 25px "Roboto"',
                food: '26px "Poetsen One"',
                description: '12px "Montserrat Light"'
            };

            const colors = {
                level: '#f6ff00',
                nickname: 'black',
                name: 'white',
                infos: 'white',
                gold: 'white',
                food: 'black',
                description: 'white'
            }

            // Informations
            var { name, nickname, level, dragonImage, food, gold, elements, health, attack, defense } = infos;

            // Background
            const background = await loadImage('src/assets/images/dragon-info-bg.png');
            ctx.drawImage(background, 0, 0);

            // Dragon Image
            dragonImage = await loadImage(dragonImage);
            ctx.drawImage(dragonImage, 37, 153);

            // Draw level
            ctx.font = fonts.level;
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillText(level, 82, height - 63);
            ctx.fillStyle = colors.level;
            ctx.fillText(level, 82, height - 65);

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
            let elementXPos = 35 + (elements.length * 17);           
            for (let element of elements)
            {
                let image = await loadImage(element);
                ctx.drawImage(image, width - elementXPos, 26, 12, 25);
                elementXPos -= 17;
            }

            // Dragon Name
            name = name.toUpperCase();
            ctx.font = fonts.name;
            ctx.textAlign = 'left';
            ctx.fillStyle = colors.name;
            ctx.fillText(name, width - 247, 83);

            // Dragon Description
            ctx.font = fonts.description;
            ctx.fillStyle = colors.description;
            let descriptionLines = ctx.getTextLines('Se você não aguenta o calor, fique longe do Dragão de Chamas! Essa criatura temperamental é facilmente detonada, mas se acalma com a mesma rapidez e sempre sente um profundo remorso pelas coisas que queimou.', 200);
            
            let descX = width - 247;
            let descY = 165;
            let descLineHeight = 14;
            
            for (let line of descriptionLines)
            {
                ctx.fillText(line, descX, descY);
                descY += descLineHeight;
            }

            // Dragon Infos
            attack = MiscUtils.formatNumber(attack, '.');
            defense = MiscUtils.formatNumber(defense, '.');
            health = MiscUtils.formatNumber(health, '.');
            ctx.font = fonts.infos;
            ctx.fillStyle = colors.infos;
            /* Attack */
            ctx.fillText(attack, width - 206, 315.5);
            /* Defense */
            ctx.fillText(defense, width - 206, 346);
            /* Health */
            ctx.fillText(defense, width - 206, 378);

            // Gold by minute
            gold = MiscUtils.formatCurrency(gold);
            ctx.font = fonts.gold;
            ctx.fillStyle = colors.gold;
            ctx.fillText(gold, width - 176.5, height - 88);

            // Food
            food = MiscUtils.shortNumber(food, 1);
            ctx.font = fonts.food;
            ctx.fillStyle = colors.food;
            ctx.textAlign = 'right';
            ctx.fillText(food, width - 323, height - 46);

            return canvas.toBuffer();
        }
        catch(err)
        {
            console.log(err);
        }
    }

    static async temples(temples)
    {
        const width = 800, 
            height = 500;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        let count = 0;
        let posX = 103;
        let posY = 141;
        let badgeX = 219;
        let badgeY = 115;
        let space = 235;

        let background = await loadImage('src/assets/images/temples-background.png');
        ctx.drawImage(background, 0, 0);

        let badge = await loadImage('src/assets/images/check-ball.png');

        for (let temple of temples)
        {
            if (count == 3)
            {
                posY = 321;
                badgeY = 295;
                posX = 103;
                badgeX = 219;
            }
            
            let image = await loadImage(temple);
            ctx.drawImage(image, posX, posY, image.width / 2, image.height / 2);
            ctx.drawImage(badge, badgeX, badgeY);

            posX += space;
            badgeX += (space);
            count++;
        }

        return canvas.toBuffer();
    }

    /**
     * Create a incubator image
     * @param {Array} eggs - The eggs progress document
     */
    static async incubator(eggs)
    {
        const width = 500, height = 500;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        const background = await loadImage('src/assets/images/incubator-1.png');
        ctx.drawImage(background, 0, 0);
        
        const firstEgg = eggs[0];
        var { id, icon, reamingTime, progress } = firstEgg;
        
        // Progress
        progress = progress / 100;
        ctx.fillStyle = '#ff0000';
        ctx.roundRect(257, 291.25, 72 * progress, 6.5, 5).fill();

        // Reaming
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.font = '18px "Arial"';
        ctx.strokeText(reamingTime, 257, 230);
        ctx.fillText(reamingTime, 257, 230);

        // Egg
        let firstIcon = await loadImage(icon);
        ctx.drawImage(firstIcon, 273, 242, 40, 40);

        return canvas.toBuffer();
    }
}