const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/payments', (req, res) => {
    
}); 

app.listen(port, () => {
    console.log('Express connected! Listenening at port ' + port);
});