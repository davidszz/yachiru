
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

//#region Start canvas
var canvasLoaded = false;
try 
{
    require('canvas');
    require('./src/utils/CanvasUtils.js').initializeHelpers();
    canvasLoaded = true;
}
catch(e)
{
    // nothing
}
//#endregion

//#region Initialize client
const client_options = {
    fetchAllMembers: false,
    enableEveryone: false,
    canvasLoaded
};

const Yachiru = require('./src/Yachiru.js');
const client = new Yachiru(client_options);

client.initialize();
// client.on('rateLimit', (...args) => console.log('rateLimit', ...args));
//#endregion

app.post('/', (req, res) => {
    console.log(req.query, req.params);
    res.sendStatus(201);
});

app.listen(port, () => {
    console.log('Express connected! Listenening at port ' + port);
});