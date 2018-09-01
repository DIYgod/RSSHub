const config = require('../../config');
const logger = require('../../utils/logger');
const wait = require('../../utils/wait');
const FormData = require('form-data');
const axios = require('../../utils/axios');
const maskHeader = require('./constants').maskHeader;

const pixivConfig = config.pixiv;

let token = null;

const authorizationInfo = {
    client_id: pixivConfig.client_id,
    client_secret: pixivConfig.client_secret,
    username: pixivConfig.username,
    password: pixivConfig.password,
};

async function getToken() {
    const data = new FormData();
    const jsonData = {
        ...authorizationInfo,
        get_secure_url: 1,
        grant_type: 'password',
    };
    for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
            const element = jsonData[key];
            data.append(key, element);
        }
    }
    const response = await axios({
        method: 'post',
        url: 'https://oauth.secure.pixiv.net/auth/token',
        data: data,
        headers: {
            ...maskHeader,
            ...data.getHeaders(),
        },
    }).catch(function() {
        logger.error('Pixiv login fail.');
    });
    return response && response.data && response.data.response;
}

async function refreshToken(refresh_token) {
    const data = new FormData();
    const jsonData = {
        ...authorizationInfo,
        get_secure_url: 1,
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
    };
    for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
            const element = jsonData[key];
            data.append(key, element);
        }
    }
    const response = await axios.post('https://oauth.secure.pixiv.net/auth/token', data, {
        headers: {
            ...maskHeader,
            ...data.getHeaders(),
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
                logger.err(`Pixiv refresh token failed, retry in ${expires_in} seconds.`, err);
            }
        }
        /* eslint-enable no-await-in-loop */
    }
}

tokenLoop();

module.exports = function getToken() {
    return token;
};
