const config = require('@/config').value;
const logger = require('@/utils/logger');
const wait = require('@/utils/wait');
const got = require('@/utils/got');
const maskHeader = require('./constants').maskHeader;
const md5 = require('@/utils/md5');

const pixivConfig = config.pixiv;

let token = null;

const authorizationInfo = {
    client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
    client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
    hash_secret: '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c',
    username: pixivConfig.username,
    password: pixivConfig.password,
};

async function getToken() {
    const localTime = new Date().toISOString().replace(/\..+/, '') + '+00:00';
    const response = await got({
        method: 'post',
        url: 'https://oauth.secure.pixiv.net/auth/token',
        form: {
            ...authorizationInfo,
            get_secure_url: 1,
            grant_type: 'password',
        },
        headers: {
            'X-Client-Time': localTime,
            'X-Client-Hash': md5(localTime + authorizationInfo.hash_secret),
            ...maskHeader,
        },
    }).catch(function() {
        logger.error('Pixiv login fail.');
    });
    return response && response.data && response.data.response;
}

async function refreshToken(refresh_token) {
    const response = await got({
        method: 'post',
        url: 'https://oauth.secure.pixiv.net/auth/token',
        form: {
            ...authorizationInfo,
            get_secure_url: 1,
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        },
        headers: {
            ...maskHeader,
        },
    });
    return response.data.response;
}

async function tokenLoop() {
    const res = await getToken();
    if (res) {
        logger.info('Pixiv login success.');
        token = res.access_token;
        let refresh_token = res.refresh_token;
        let expires_in = res.expires_in * 0.9;
        /* eslint-disable no-constant-condition, no-await-in-loop */
        while (true) {
            await wait(expires_in * 1000);
            try {
                const refresh_res = await refreshToken(refresh_token);
                logger.debug('Pixiv refresh token success.');
                token = refresh_res.access_token;
                refresh_token = refresh_res.refresh_token;
                expires_in = refresh_res.expires_in * 0.9;
            } catch (err) {
                expires_in = 30;
                logger.error(`Pixiv refresh token failed, retry in ${expires_in} seconds.`, err);
            }
        }
        /* eslint-enable no-await-in-loop */
    }
}

if (config.pixiv && config.pixiv.username && config.pixiv.password) {
    tokenLoop();
}

module.exports = function getToken() {
    return token;
};
