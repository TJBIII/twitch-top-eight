'use strict';

// load env variables
require('dotenv').config();

const express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    https = require('https'),
    path = require('path'),
    request = require('request'),
    utils = require('./modules/utils'),
    helpers = require('./modules/index'),
    jwt = require('jsonwebtoken');

const bearerPrefixLength = 7;

utils.assertEnvVar('NODE_ENV');
utils.assertEnvVar('SHARED_SECRET');

const SHARED_SECRET = Buffer.from(process.env.SHARED_SECRET, 'base64');
const clientId = 'fp6wx90nh8ciwtqb6male0jen9dap8';

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log('Got request', req.path, req.method);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    // Note that the origin of an extension iframe will be null
    // so the Access-Control-Allow-Origin has to be wildcard.
    res.setHeader('Access-Control-Allow-Origin', '*');
    return next();
});

app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.get(/^\/frontend\/(.*)/, (req, res) => {
    // This route is for testing phase so that we can return
    // frontend assets from localhost without a separate service
    console.log(req.params[0]);
    res.sendFile(path.join(__dirname, '../frontend', req.params[0]));
});

app.get('/top', (req, res) => {
    if (!req.headers.authorization) {
        res.sendStatus(403);
        res.end();
        return;
    }

    const incomingJwt = req.headers.authorization.slice(bearerPrefixLength);

    jwt.verify(incomingJwt, SHARED_SECRET, {algorithms: ['HS256']}, (err, source) => {
        if (err) {
            console.log('unable to verify jwt', err);
            res.sendStatus(403);
            res.end();
            return;
        }

        const channelID = req.query.channelID;

        console.log('successfully verified user, serve up the top 8 for the channel', channelID);
        let top = [{position: 2, display_name: 'tBUIDa8', logo: 'https://static-cdn.jtvnw.net/jtv_user_pictures/tbuida8-profile_image-b5617a5a20025236-300x300.png'}, {position: 1, display_name: 'testFriend', url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/drdisrespectlive-profile_image-abc1fc67d2ea1ae1-300x300.png'}]
        while (top.length < 8) {
            top.push({position: top.length + 1, display_name: `friend${top.length + 1}`, logo: null});
        }

        let response = {data: top}

        res.send(response);
    });
});

app.post('/saveTop', (req, res) => {
    if (!req.headers.authorization) {
        res.sendStatus(403);
        res.end();
        return;
    }

    const incomingJwt = req.headers.authorization.slice(bearerPrefixLength);

    jwt.verify(incomingJwt, SHARED_SECRET, {algorithms: ['HS256']}, (err, source) => {
        if (err) {
            console.log('unable to verify jwt', err);
            res.sendStatus(403);
            res.end();
            return;
        }

        console.log('successfully verified user, save their selected top 8 now');
        console.log('save top 8 data', req.body);

        helpers.saveTopForChannel(req.body.channelID, req.body.top).then(() => {
            console.log('top 8 saved');
            res.sendStatus(200);
        }, err => {
            console.log('error savingtopforchannel promise', err);
        });
    });
})

const PORT = 8000;

if (process.env.NODE_ENV === 'development') {
    const options = {
        key: fs.readFileSync('/certs/top8.key'),
        cert: fs.readFileSync('/certs/top8.crt')
    };

    https.createServer(options, app).listen(PORT, () => {
        console.log('top 8 backend service running on https', PORT);
    });
} else {
    app.listen(80, () => {
        console.log(`listening on port 80`);
    });
}
