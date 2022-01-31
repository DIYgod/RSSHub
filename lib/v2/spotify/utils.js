const config = require('@/config').value;
const got = require('@/utils/got');

// Token used to retrieve public information.
async function getPublicToken() {
    if (!config.spotify || !config.spotify.apiKey || !config.spotify.apiSecret) {
        // TODO: link
        throw 'Spotify public RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }

    const tokenResponse = await got
        .post('https://accounts.spotify.com/api/token', {
            headers: {
                Authorization: `Basic ${Buffer.from(`${config.spotify.apiKey}:${config.spotify.apiSecret}`).toString('base64')}`,
            },
            form: {
                grant_type: 'client_credentials',
            },
        })
        .json();
    return tokenResponse.access_token;
}

module.exports = {
    getPublicToken,
};
