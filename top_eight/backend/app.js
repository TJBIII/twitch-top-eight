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
utils.assertEnvVar('EXT_CLIENT_ID');

let raygun;
if (process.env.NODE_ENV === 'production') {
    raygun = require('./modules/raygun').client;
    console.log = () => {};
} else {
    raygun = {send: (err) => {console.error(`dev: reporting raygun error ${err}`)}};
}

const SHARED_SECRET = Buffer.from(process.env.SHARED_SECRET, 'base64');

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

if (process.env.NODE_ENV === 'development') {
    app.get(/^\/frontend\/(.*)/, (req, res) => {
        // This route is for testing phase so that we can return
        // frontend assets from localhost without a separate service
        console.log(req.params[0]);
        res.sendFile(path.join(__dirname, '../frontend', req.params[0]));
    });
}

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

        helpers.getTopForChannel(channelID).then(top => {
            console.log('top', top);
            let response = {data: top};
            res.send(response);
        }, err => {
            raygun.send(err);
        });
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

        helpers.saveTopForChannel(req.body.channelID, req.body.top).then(savedTop => {
            console.log('top 8 saved');
            let status = 200,
                data = {message: 'Successfully saved!', savedTop};

            res.send({status, data});
        }, err => {
            let status = 200,
                data = {error: err};
            console.log('error savingtopforchannel promise', err);
            res.send({status, data});
            raygun.send(err);
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
        console.error('top 8 backend service running on https', PORT);
    });
} else {
    app.listen(80, () => {
        console.error(`listening on port 80`);
    });
}
