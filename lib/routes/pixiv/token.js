const config = require('@/config').value;
const logger = require('@/utils/logger');
const got = require('./pixiv-got');
const { maskHeader } = require('./constants');

let token = null;

const authorizationInfo = {
    client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
    client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
    hash_secret: '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c',
};

const refreshToken = () =>
    got({
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
    }).catch((e) => {
        logger.error('Pixiv refresh token failed.');
        logger.debug(e);
    });

async function tickToken() {
    const result = await refreshToken();
    let expireTime;
    if (result && result.access_token) {
        logger.debug('Pixiv refresh token success.');
        token = result.access_token;
        expireTime = result.expires_in;
    } else {
        expireTime = 30;
        logger.error(`Pixiv refresh token failed, retry in ${expireTime} seconds.`);
    }
    // If is package, the mock server should be closed after request, needn't to refresh
    if (!config.isPackage) {
        setTimeout(tickToken, expireTime);
    }
}

module.exports = async () => {
    if (!token) {
        await tickToken();
    }
    return token;
};

module.exports.tickToken = tickToken;
