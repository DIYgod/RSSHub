// @ts-nocheck
import { config } from '@/config';
const login = require('./login');

let tokenIndex = 0;
let authentication = null;
let first = true;

async function initToken() {
    if (config.twitter.username && config.twitter.password && !authentication && first) {
        authentication = await login();
        first = false;
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
