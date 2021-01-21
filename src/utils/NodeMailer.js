const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

async function sendMail(options = {})
{
    const { to, subject, html } = options;
    if (!to) return;

    const infos = { 
        from: '"Yachiru Suporte" <suporte.yachiru@gmail.com>',
        to
    };

    if (html) 
    {
        infos.html = html;
    }
    else infos.text = 'Não há conteúdo.';
    
    if (subject)
    {
        infos.subject = subject;
    }

    const info = await transporter.sendMail(infos)
        .catch(() => null);

    return info;
}

module.exports.sendMail = sendMail;