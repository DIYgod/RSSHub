const config = require('@/config').value;
const logger = require('@/utils/logger');
const wait = require('@/utils/wait');
const got = require('./pixiv-got');
const { maskHeader } = require('./constants');

let token = null;

const authorizationInfo = {
    client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
    client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
    hash_secret: '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c',
};

async function refreshToken() {
    const response = await got({
        method: 'post',
        url: 'https://oauth.secure.pixiv.net/auth/token',
        form: {
            ...authorizationInfo,
            get_secure_url: 1,
            grant_type: 'refresh_token',
            refresh_token: config.pixiv.refreshToken,
        },
        headers: {
            ...maskHeader,
        },
        responseType: 'json',
        resolveBodyOnly: true,
    }).catch(function (e) {
        logger.error('Pixiv refresh token failed.');
        logger.debug(e);
    });
    return response;
}

async function tokenLoop() {
    const res = await refreshToken();
    if (res && res.access_token) {
        logger.info('Pixiv login success.');
        token = res.access_token;
        let expires_in = res.expires_in * 0.9;
        /* eslint-disable no-constant-condition, no-await-in-loop */
        while (true) {
            await wait(expires_in * 1000);
            const refresh_res = await refreshToken();
            if (refresh_res && refresh_res.access_token) {
                logger.debug('Pixiv refresh token success.');
                token = refresh_res.access_token;
                expires_in = refresh_res.expires_in * 0.9;
            } else {
                expires_in = 30;
                logger.error(`Pixiv refresh token failed, retry in ${expires_in} seconds.`);
            }
        }
        /* eslint-enable no-await-in-loop */
    }
}

if (config.pixiv && config.pixiv.refreshToken) {
    tokenLoop();
}

module.exports = function getToken() {
    return token;
};

module.exports.refreshToken = refreshToken;
