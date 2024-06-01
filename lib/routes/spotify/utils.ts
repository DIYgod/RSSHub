import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import ofetch from '@/utils/ofetch';

// Token used to retrieve public information.
async function getPublicToken() {
    if (!config.spotify || !config.spotify.clientId || !config.spotify.clientSecret) {
        throw new ConfigNotFoundError('Spotify public RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const { clientId, clientSecret } = config.spotify;

    const tokenResponse = await ofetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
        }).toString(),
    });
    return tokenResponse.access_token;
}

// Token used to retrieve user-specific information.
// Note that we don't use PKCE since the client secret shall be safe on the server.
async function getPrivateToken() {
    if (!config.spotify || !config.spotify.clientId || !config.spotify.clientSecret || !config.spotify.refreshToken) {
        throw new ConfigNotFoundError('Spotify private RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const { clientId, clientSecret, refreshToken } = config.spotify;

    const tokenResponse = await ofetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }).toString(),
    });
    return tokenResponse.access_token;
}

const parseTrack = (x) => ({
    title: x.name,
    author: x.artists.map((a) => a.name).join(', '),
    description: `"${x.name}" by ${x.artists.map((a) => a.name).join(', ')} from the album "${x.album.name}"`,
    link: x.external_urls.spotify,
});

const parseArtist = (x) => ({ title: x.name, description: `${x.name}, with ${x.followers.total} followers`, link: x.external_urls.spotify });

export default { getPublicToken, getPrivateToken, parseTrack, parseArtist };
