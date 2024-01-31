const config = require('@/config').value;
const login = require('./login');

let tokenIndex = 0;
let authentication = null;

async function initToken(tryGet) {
    if (config.twitter.username && config.twitter.password && !authentication) {
        authentication = await login(tryGet);
    }
}

function getToken() {
    let token;
    if (config.twitter.username && config.twitter.password) {
        if (authentication) {
            token = {
                key: authentication.oauth_token,
                secret: authentication.oauth_token_secret,
            };
        }
    } else if (config.twitter.oauthTokens?.length && config.twitter.oauthTokenSecrets.length && config.twitter.oauthTokens.length === config.twitter.oauthTokenSecrets.length) {
        token = {
            key: config.twitter.oauthTokens[tokenIndex],
            secret: config.twitter.oauthTokenSecrets[tokenIndex],
        };

        tokenIndex++;
        if (tokenIndex >= config.twitter.oauthTokens.length) {
            tokenIndex = 0;
        }
    } else {
        throw new Error('Invalid twitter configs');
    }

    return token;
}

module.exports = {
    initToken,
    getToken,
};
