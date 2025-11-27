import { config } from '@/config';
import logger from '@/utils/logger';

import { maskHeader } from './constants';
import got from './pixiv-got';

let token = null;

const authorizationInfo = {
    client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
    client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
    hash_secret: '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c',
};

const refreshToken = (tryGet) =>
    tryGet(
        'pixiv:accessToken',
        () =>
            got.post('https://oauth.secure.pixiv.net/auth/token', {
                form: {
                    ...authorizationInfo,
                    get_secure_url: 1,
                    grant_type: 'refresh_token',
                    refresh_token: config.pixiv.refreshToken,
                },
                headers: {
                    ...maskHeader,
                },
            }),
        3600,
        false
    );

async function getToken(tryGet) {
    const { data } = await refreshToken(tryGet);
    // let expireTime;
    if (data && data.access_token) {
        logger.debug('Pixiv refresh token success.');
        token = data.access_token;
        // expireTime = result.expires_in;
    }
    // } else {
    // expireTime = 30;
    // logger.error(`Pixiv refresh token failed, retry in ${expireTime} seconds.`);
    // }
    // If is package, the mock server should be closed after request, needn't to refresh
    // if (!config.isPackage) {
    //     setTimeout(tickToken, expireTime * 1000);
    // }
    return token;
}

export { getToken };

// let tickTokenStarted = false;

// async function startTickToken(tryGet) {
//     if (!tickTokenStarted) {
//         // 如果tickToken没启动
//         tickTokenStarted = true;
//         await tickToken(tryGet); // 启动tickToken
//     }
// }

// async function waitForToken() {
//     while (!token) {
//         // eslint-disable-next-line no-await-in-loop
//         await new Promise((resolve) => setTimeout(resolve, 0));
//     }
//     return token;
// }

// export default async (tryGet) => {
//     await startTickToken(tryGet);
//     return waitForToken();
// };

// module.exports.tickToken = tickToken;
