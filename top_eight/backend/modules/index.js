const rp = require('request-promise-native'),
    twitch = require('./twitch'),
    redis = require('redis');

const redisOptions = {};

let db,
    redisPort,
    redisHost;

if (process.env.NODE_ENV === 'development') {
    redisPort = 6379;
    redisHost = 'cache';
    redis.debug_mode = false;
} else {
    redisPort = 6379;
    redisHost = '35.202.241.246'; // redis VM external IP address in the gamewisp-analytics project
}

db = redis.createClient(redisPort, redisHost, redisOptions);

if (process.env.NODE_ENV === 'production') {
    db.auth(process.env.REDIS_PASSWORD);
}

const KRAKEN_API_ROOT = 'https://api.twitch.tv/kraken';
const CLIENT_ID = 'fp6wx90nh8ciwtqb6male0jen9dap8';

exports.getTopForChannel = channelID => {
    return new Promise((resolve, reject) => {
        db.get(`twitchTopPE:top:${channelID}`, (err, topData) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(JSON.parse(topData));
        });
    });
};

exports.saveTopForChannel = (channelID, top) => {
    let usernamesArr = top.map(member => member.display_name).filter(member => !member.display_name);

    console.log('usernamesArr', usernamesArr);

    // verify that users exist
    return new Promise ((resolve, reject) => {
        twitch.getUsers(usernamesArr).then(twitchUserData => {
            console.log('twitchUserData', twitchUserData);

            // TODO: SAVE TO REDIS
            resolve(twitchUserData);
        }, err => {
            reject(err);
        });
    });
}
