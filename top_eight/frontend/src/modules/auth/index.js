const $ = require('jquery');
const BASE_API_ENDPOINT = (process.env.NODE_ENV === 'development') ? 'https://localhost.twitch.tv:3002' : 'TODO: prod URL';

class AuthHandler {
    constructor(initialAuthCallback, updateAuthCallback) {
        this.auth = null;
        this.authCount = 0;
        this.initialAuthCallback = initialAuthCallback ? initialAuthCallback : () => {};
        this.updateAuthCallback = updateAuthCallback ? updateAuthCallback : () => {};
    }

    getAuthToken() {
        return this.auth.token;
    }

    getChannelID() {
        return this.auth.channelId
    }

    handleAuth(authData) {
        this.auth = authData;
        this.authCount++;

        if (this.authCount === 1) {
            this.initialAuthCallback(authData);
        } else if (this.authCount > 1) {
            this.updateAuthCallback(authData);
        }
    }
}

module.exports = AuthHandler;
