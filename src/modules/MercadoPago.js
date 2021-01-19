const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

module.exports = (client) => {
    app.post('/payments/notification', (req, res) => {
        const body = req.body || {};
        if (body.type === 'payment')
        {
            client.emit('paymentNotification', body);
        }
        
        res.sendStatus(200);
    });

    app.listen(port, () => {
        client.log('Express connected! Listenening at port ' + port, { color: 'green', tags: [ 'MercadoPago' ] });
    });
}