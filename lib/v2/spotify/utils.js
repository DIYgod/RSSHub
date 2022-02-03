const config = require('@/config').value;
const got = require('@/utils/got');

// Token used to retrieve public information.
async function getPublicToken() {
    if (!config.spotify || !config.spotify.apiKey || !config.spotify.apiSecret) {
        // TODO: link
        throw 'Spotify public RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }

    const { apiKey, apiSecret } = config.spotify;

    const tokenResponse = await got
        .post('https://accounts.spotify.com/api/token', {
            headers: {
                Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
            },
            form: {
                grant_type: 'client_credentials',
            },
        })
        .json();
    return tokenResponse.access_token;
}

// Token used to retrieve user-specific information.
// Note that we don't use PKCE since the client secret shall be safe on the server.
async function getPrivateToken() {
    if (!config.spotify || !config.spotify.apiKey || !config.spotify.apiSecret || !config.spotify.refreshToken) {
        // TODO: link
        throw 'Spotify private RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }

    const { apiKey, apiSecret, refreshToken } = config.spotify;

    const tokenResponse = await got
        .post('https://accounts.spotify.com/api/token', {
            headers: {
                Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
            },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            },
        })
        .json();
    return tokenResponse.access_token;
}

module.exports = {
    getPublicToken,
    getPrivateToken,
};
