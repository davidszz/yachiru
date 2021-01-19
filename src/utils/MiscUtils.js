const humanizeDuration = require('humanize-duration');
const moment = require('moment');
const Intl = require('intl');

moment.locale('pt-BR');

class MiscUtils
{
    static capitalize(str)
    {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static formatCurrency(number, code = 'pt-BR')
    {
        let intl = new Intl.NumberFormat(code, { style: 'currency', currency: 'BRL' });
        return intl.format(number);
    }

    static alphaString(str)
    {
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9 \-]+/g, '');
    }

    static sameString(str, compare)
    {
        let lowerStr = str.toLowerCase();
        let lowerComparation = compare.toLowerCase();

        if (lowerStr == lowerComparation)
            return true;

        return MiscUtils.alphaString(lowerStr) == MiscUtils.alphaString(lowerComparation);
    }   

    /**
     * Create a short number like 3.55k
     * @param {Number} num - The num to convert to short 
     * @param {Number} digits - The maximium of digits to return conversion
     * @param {String} separator - The spacer like 3"."55k
     */
    static shortNumber(num, digits, separator = '.')
    {
        if (!num) return '0';

        const si = [
            { value: 1E9, symbol: 'BI' },
            { value: 1E6, symbol: 'M' },
            { value: 1E3, symbol: 'k' },
            { value: 1, symbol: '' }
        ];

        const regex = /\.0+$|(\.[0-9]*[1-9])0+$/;
        let i;
        for (i = 0; i < si.length; i++)
        {
            if (num >= si[i].value)
                break;
        }

        return `${(num / si[i].value).toFixed(digits).replace(regex, '$1')}${si[i].symbol}`.replace('.', separator);
    }

    static shortDuration(ms, limit = 3)
    {
        const shortHumanizer = humanizeDuration.humanizer({
            language: "shortEn",
            languages: {
                shortEn: {
                    y: () => "a",
                    mo: () => "m",
                    w: () => "sm",
                    d: () => "d",
                    h: () => "h",
                    m: () => "m",
                    s: () => "s",
                    ms: () => "ms",
                },
            },
        });

        return shortHumanizer(ms, {
            units: [ 'd', 'h', 'm', 's' ],
            round: true,
            largest: limit,
            delimiter: ' ',
            spacer: ''
        });
    }

    static parseDuration(ms, limit = 3, units = [ 'mo', 'w', 'd', 'h' ])
    {
        return humanizeDuration(ms, {
            language: 'pt',
            units,
            round: true,
            largest: limit,
            conjunction: " e ", 
            serialComma: false
        });
    }

    static fromNow(ms)
    {
        return moment(ms).fromNow();
    }

    static toNow(ms)
    {
        return moment(ms).toNow();
    }

    static formatNumber(num, separator = ',')
    {
        num = parseInt(num);
        const formatter = Intl.NumberFormat('en-US');
        return formatter.format(num).split(',').join(separator);
    }

    static randString(length)
    {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        const result = [];
        for (let i = 0; i < length; i++)
        {
            result.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }

        return result.join('');
    }
}

module.exports = MiscUtils;