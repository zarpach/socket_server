const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const {readFile} = require("fs");
const https = require('https');

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.send("Express on Vercel");
})

app.get('/.well-known/assetslinks.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(__dirname + '/assetslinks.json');
});

app.get('/generateToken', (req, res) => {
    const appId = 'bcf7d096b0e54d6d906e12879d9cec7e';
    const appCertificate = 'd58f7220740b4c92b082f1239a9063fb';
    const channelName = req.query.channelName || 'defaultChannel';
    const uid = req.query.uid || 0; // If 0, Agora server will assign a uid
    const role = RtcRole.PUBLISHER;

    const expirationTimeInSeconds = 3600;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const key = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        role,
        privilegeExpiredTs
    );

    res.json({ token: key });
});


app.get('/test', (req, res) => {
    res.json({
        hi: 'Hello!'
    })
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


module.exports = app;