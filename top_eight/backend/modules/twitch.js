const rp = require('request-promise-native');
const utils = require('./utils');

const KRAKEN_API_ROOT = 'https://api.twitch.tv/kraken';
const CLIENT_ID = process.env.EXT_CLIENT_ID;

exports.getUsers = usernameArr => {
    usernameArr = usernameArr.filter(username => utils.isValidUsername(username));

    if (!usernameArr.length) {
        return Promise.resolve([]);
    };

    const options = {
        uri: `${KRAKEN_API_ROOT}/users`,
        headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': CLIENT_ID
        },
        qs: {
            login: usernameArr.join(',')
        },
        json: true
    };

    return rp(options);
};
