const rp = require('request-promise-native');

const KRAKEN_API_ROOT = 'https://api.twitch.tv/kraken';
const CLIENT_ID = 'fp6wx90nh8ciwtqb6male0jen9dap8';

exports.getUsers = usernameArr => {
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
