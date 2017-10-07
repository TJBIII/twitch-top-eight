const $ = require('jquery');
const querystring = require('querystring');

const BASE_API_ENDPOINT = (process.env.NODE_ENV === 'development') ? 'https://localhost.twitch.tv:3002' : 'https://top-8.gamewisp.com';

function request(method, path, options = {}) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${BASE_API_ENDPOINT}/${path}/${options.qs ? `?${querystring.stringify(options.qs)}` : ''}`,
            method,
            dataType: 'json',
            data: options.body ? JSON.stringify(options.body) : undefined,
            headers: {
                'Authorization': options.auth ? `Bearer ${options.auth.token}` : null,
                'Content-Type': 'application/json'
            },
            timeout: 30000,
            success: data => resolve(data),
            error: ({status, responseJSON}) => reject({
                status,
                data: responseJSON
            })
        });
    });
}

exports.get = (path, options) => {
    return request('GET', path, options);
};

exports.post = (path, options) => {
    return request('POST', path, options);
};
