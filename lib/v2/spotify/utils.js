const config = require('@/config').value;
const got = require('@/utils/got');

// Token used to retrieve public information.
async function getPublicToken() {
    if (!config.spotify || !config.spotify.clientId || !config.spotify.clientSecret) {
        throw 'Spotify public RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }

    const { clientId, clientSecret } = config.spotify;

    const tokenResponse = await got
        .post('https://accounts.spotify.com/api/token', {
            headers: {
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
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
    if (!config.spotify || !config.spotify.clientId || !config.spotify.clientSecret || !config.spotify.refreshToken) {
        throw 'Spotify private RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }

    const { clientId, clientSecret, refreshToken } = config.spotify;

    const tokenResponse = await got
        .post('https://accounts.spotify.com/api/token', {
            headers: {
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            },
        })
        .json();
    return tokenResponse.access_token;
}

const parseTrack = (x) => ({
    title: x.name,
    author: x.artists.map((a) => a.name).join(', '),
    description: `"${x.name}" by ${x.artists.map((a) => a.name).join(', ')} from the album "${x.album.name}"`,
    link: x.external_urls.spotify,
});

const parseArtist = (x) => ({ title: x.name, description: `${x.name}, with ${x.followers.total} followers`, link: x.external_urls.spotify });

module.exports = {
    getPublicToken,
    getPrivateToken,
    parseTrack,
    parseArtist,
};
