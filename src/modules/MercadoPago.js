const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

module.exports = (client) => {
    app.post('/payments', (req, res) => {
        console.log(req.body);
        res.sendStatus(200);
    }); 

    app.get('/payments', (req, res) => {
        res.sendStatus(200);
    })

    app.listen(port, () => {
        client.log('Express connected! Listenening at port ' + port, { color: 'green', tags: [ 'MercadoPago' ] });
    });
}