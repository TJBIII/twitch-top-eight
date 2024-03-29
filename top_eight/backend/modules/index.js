const rp = require('request-promise-native'),
    utils = require('./utils'),
    twitch = require('./twitch'),
    twitchPubSub = require('./pubsub/twitch'),
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
const CLIENT_ID = process.env.EXT_CLIENT_ID;

const saveTopToRedis = (confirmedTop, channelID) => {
    return new Promise((resolve, reject) => {
        db.set(`twitchTopPE:top:${channelID}`, JSON.stringify(confirmedTop), (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(confirmedTop);
            }
        });
    });
};

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
    let usernameArr = top.map(member => member.display_name).filter(username => {
        if (!username || !utils.isValidUsername(username)) return false;

        return true;
    });

    console.log('usernameArr', usernameArr);

    // verify that users exist
    return new Promise ((resolve, reject) => {
        if (top.length > 8) {
            reject('Only 8 friends allowed.');
            return;
        }

        twitch.getUsers(usernameArr).then(twitchUserData => {
            let confirmedTop = utils.compareTopWithTwitch(top, twitchUserData);

            // update so we have the correct positions
            confirmedTop = confirmedTop.map((member, idx) => {
                member.position = idx + 1;
                return member;
            });

            return saveTopToRedis(confirmedTop, channelID);
        }, err => {
            reject(err);
        }).then(confirmedTop => {
            resolve(confirmedTop);

            // broadcast new top via twitch pub sub
            twitchPubSub.broadcast(channelID, {evt: 'updateTop', top: confirmedTop})
        }, err => {
            reject(err);
        });
    });
};
