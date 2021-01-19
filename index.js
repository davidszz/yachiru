
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.post('/notification', (req, res) => {
    res.sendStatus(200);
})

app.listen(PORT, () => {
    console.log('Express connected! Listenening at port ' + PORT);
});