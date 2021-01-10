const { registerFont, CanvasRenderingContext2D } = require('canvas');

module.exports = class CanvasUtils
{
    static initializeHelpers() 
    {
        // Initialize fonts
        registerFont('src/assets/fonts/Poppins-Regular.ttf', { family: 'Poppins' });
        registerFont('src/assets/fonts/Poppins-Medium.ttf', { family: 'Poppins Medium' });
        registerFont('src/assets/fonts/Poppins-Bold.ttf', { family: 'Poppins', weight: 'bold' });
        registerFont('src/assets/fonts/Poppins-Light.ttf', { family: 'Poppins Light' });
        registerFont('src/assets/fonts/NoticiaText-Bold.ttf', { family: 'NoticiaText', weight: 'bold' });
        registerFont('src/assets/fonts/friz-quadrata-std-bold.otf', { family: 'Friz Quadrata', weight: 'bold' });
        registerFont('src/assets/fonts/PoetsenOne-Regular.ttf', { family: 'Poetsen One' });
        registerFont('src/assets/fonts/OpenSans-Bold.ttf', { family: 'Open Sans', weight: 'bold' });
        registerFont('src/assets/fonts/Montserrat-Light.ttf', { family: 'Montserrat Light' });
        registerFont('src/assets/fonts/Roboto-Bold.ttf', { family: 'Roboto', weight: 'bold' });

        // Context functions
        CanvasRenderingContext2D.prototype.roundImage = function(img, x, y, wh)
        {
            this.save();
            this.beginPath();
            this.arc(x + (wh/2), y + (wh/2), wh/2, 0, Math.PI * 2, true);
            this.closePath();
            this.clip();

            this.drawImage(img, x, y, wh, wh);

            this.beginPath();
            this.arc(0, 0, wh/2, 0, Math.PI * 2, true);
            this.clip();
            this.closePath();
            this.restore();
        }

        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            
            this.beginPath();
            this.moveTo(x+r, y);
            this.arcTo(x+w, y,   x+w, y+h, r);
            this.arcTo(x+w, y+h, x,   y+h, r);
            this.arcTo(x,   y+h, x,   y,   r);
            this.arcTo(x,   y,   x+w, y,   r);
            this.closePath();

            return this;
        }

        CanvasRenderingContext2D.prototype.progressCircle = function(x, y, size, progress) 
        {
            this.arc(x, y, size, (Math.PI / 107.8) * 270, (Math.PI / 107.8) * (270 + ((progress / 100) * 216)));
        }

        CanvasRenderingContext2D.prototype.getTextLines = function(text, maxWidth)
        {
            let lines = [];
            let completeWord = '';
            
            let words = text.split(/ +/g);
            let width = 0;

            for (let i = 0; i < words.length; i++)
            {
                let word = words[i];
                completeWord += ' ';

                let wordWidth = this.measureText(word).width;
                let currentWidth = this.measureText(completeWord).width;

                if ((currentWidth + wordWidth) >= maxWidth)
                {
                    lines.push(completeWord.trim().trimEnd());
                    completeWord = '';
                    width = 0;
                }
                else 
                {
                    width = currentWidth + wordWidth;
                    completeWord += word;
                }
            }

            return lines;
        }
    }
}