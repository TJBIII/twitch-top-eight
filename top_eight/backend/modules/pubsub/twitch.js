const rp = require('request-promise-native'),
    jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.EXT_CLIENT_ID;
const SHARED_SECRET = Buffer.from(process.env.SHARED_SECRET, 'base64');
const MESSAGE_ENDPOINT = 'https://api.twitch.tv/v5/extensions/message'

const getExpiration = () => Math.floor(new Date().getTime() / 1000) + 60;

// NOTE: rate limited to one message per second per channel by twitch
exports.broadcast = (twitchChannelID, data) => {
    if (typeof data === 'object') {
        data = JSON.stringify(data);
    }

    let target = 'broadcast',
        expires = getExpiration();
  
    let tokenPayload = {
        exp: expires,
        channel_id: twitchChannelID,
        role: 'external',
        pubsub_perms: {
            send:[target]
        }
    };
  
    let signedJwt = jwt.sign(tokenPayload, SHARED_SECRET);

    let options = {
        method: 'POST',
        uri: `${MESSAGE_ENDPOINT}/${twitchChannelID}`,
        headers: {
            'Client-ID': CLIENT_ID,
            'Content-Type': 'application/json'
        },
        body: {
            auth: signedJwt,
            content_type: 'application/json',
            message: data,
            targets:[target]
        },
        json: true
    };

    return rp(options);
};
