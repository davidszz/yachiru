const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

module.exports = (client) => {
    app.get('/payments/notification', (req, res) => {
        console.log('query', req.query, 'params', req.params);
        res.sendStatus(200);
    });

    app.listen(port, () => {
        client.log('Express connected! Listenening at port ' + port, { color: 'green', tags: [ 'MercadoPago' ] });
    });
}