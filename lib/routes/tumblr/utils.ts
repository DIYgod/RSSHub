import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';

const getAccessToken: () => Promise<string | null> = async () => {
    let accessToken: string | null = await cache.get('tumblr:accessToken', false);
    if (!accessToken) {
        try {
            const newAccessToken = await tokenRefresher();
            if (newAccessToken) {
                accessToken = newAccessToken;
            }
        } catch (error) {
            // Return the `accessToken=null` value to indicate that the token is not available. Calls will only use the `apiKey` as a fallback to maybe hit non "dashborad only" blogs.
            logger.error('Failed to refresh Tumblr token, using only client id as fallback', error);
        }
    }
    return accessToken;
};

const generateAuthHeaders: () => Promise<{ Authorization?: string }> = async () => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return {};
    }
    return {
        Authorization: `Bearer ${accessToken}`,
    };
};

const generateAuthParams: () => string = () => config.tumblr.clientId!;

const processPost: (post: any) => DataItem = (post) => {
    let description = '';

    switch (post.type) {
        case 'text':
            description = post.body;
            break;
        case 'answer':
            description += post.asking_url === null ? `<p>${post.asking_name} asks:</p>` : `<p><a href="${post.asking_url}">${post.asking_name}</a> asks:</p>`;
            description += post.question;
            description += '<hr>';
            description += `<p><a href="${post.blog.url}">${post.blog_name}</a> answers:</p>`;
            description += post.answer;
            break;
        case 'photo':
            for (const photo of post.photos ?? []) {
                description += `<img src="${photo.original_size.url}"/><br/>`;
            }
            break;
        case 'link':
            description = post.url;
            break;
        case 'audio':
            description = post.embed;
            break;
        default:
            break;
    }

    return {
        author: post.blog_name,
        id: post.id_string,
        title: post.summary ?? `New post from ${post.blog_name}`,
        link: post.post_url,
        pubDate: parseDate(post.timestamp * 1000),
        category: post.tags,
        description,
    };
};

let tokenRefresher: () => Promise<string | null> = () => Promise.resolve(null);
if (config.tumblr && config.tumblr.clientId && config.tumblr.clientSecret && config.tumblr.refreshToken) {
    tokenRefresher = async (): Promise<string | null> => {
        let refreshToken = config.tumblr.refreshToken;

        // Restore already refreshed tokens
        const previousRefreshTokenSerialized = await cache.get('tumblr:refreshToken', false);
        if (previousRefreshTokenSerialized) {
            const previousRefreshToken = JSON.parse(previousRefreshTokenSerialized);
            if (previousRefreshToken.startToken === refreshToken) {
                refreshToken = previousRefreshToken.currentToken;
            }
        }
        const response = await got.post('https://api.tumblr.com/v2/oauth2/token', {
            form: {
                grant_type: 'refresh_token',
                client_id: config.tumblr.clientId,
                client_secret: config.tumblr.clientSecret,
                refresh_token: refreshToken,
            },
        });
        if (!response.data?.access_token || !response.data?.refresh_token) {
            return null;
        }
        const accessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;
        const expiresIn = response.data.expires_in;

        // Access tokens expire after 42 minutes, remove 30 seconds to renew the token before it expires (to avoid making a request right when it ends).
        await cache.set('tumblr:accessToken', accessToken, (expiresIn ?? 2520) - 30);
        // Store the new refresh token associated with the one that was provided first.
        // We may be able to restore the new token if the app is restarted. This will avoid reusing the old token and have a failing request.
        // Keep it for a year (not clear how long the refresh token lasts).
        const cacheEntry = { startToken: config.tumblr.refreshToken, currentToken: newRefreshToken };
        await cache.set(`tumblr:refreshToken`, JSON.stringify(cacheEntry), 31_536_000);

        return accessToken;
    };
}

export default { processPost, generateAuthParams, generateAuthHeaders };
