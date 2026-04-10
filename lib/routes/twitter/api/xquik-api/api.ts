/**
 * Xquik API backend for Twitter/X routes.
 *
 * Uses the Xquik REST API ($0.00015/tweet) as an alternative to:
 * - Web API (requires auth_token cookies, breaks when Twitter changes frontend)
 * - Developer API (requires consumer_key/secret, $0.005/tweet)
 * - Mobile API (disabled since Oct 2025 attestation check)
 *
 * Set XQUIK_API_KEY to enable. Get a key at https://xquik.com
 */

import { config } from '@/config';
import logger from '@/utils/logger';

const BASE = 'https://xquik.com/api/v1';

function getApiKey(): string {
    return config.twitter.xquikApiKey || '';
}

async function xquikGet(path: string, params: Record<string, string | number> = {}): Promise<any> {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            qs.set(key, String(value));
        }
    }
    const url = qs.toString() ? `${BASE}${path}?${qs}` : `${BASE}${path}`;

    const res = await fetch(url, {
        headers: {
            'X-API-Key': getApiKey(),
            Accept: 'application/json',
        },
        signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Xquik API ${res.status}: ${body.slice(0, 200)}`);
    }

    return res.json();
}

/**
 * Map a Xquik tweet to the legacy format expected by ProcessFeed in utils.ts.
 */
function mapTweetToLegacy(tweet: any): Record<string, any> {
    const author = tweet.author || {};

    return {
        id_str: tweet.id,
        conversation_id_str: tweet.conversationId || tweet.id,
        full_text: tweet.text || '',
        text: tweet.text || '',
        created_at: tweet.createdAt || '',
        user: {
            id_str: author.id || '',
            name: author.name || '',
            screen_name: author.username || '',
            profile_image_url_https: author.profilePicture || '',
            verified: author.verified || false,
        },
        entities: {
            urls: (tweet.entities?.urls || []).map((u: any) => ({
                url: u.url || '',
                expanded_url: u.expanded_url || u.url || '',
                display_url: u.display_url || u.url || '',
            })),
            hashtags: (tweet.entities?.hashtags || []).map((h: any) => ({
                text: h.tag || h.text || '',
            })),
            user_mentions: (tweet.entities?.mentions || []).map((m: any) => ({
                id_str: m.id || '',
                screen_name: m.username || '',
                name: m.username || '',
            })),
        },
        public_metrics: {
            retweet_count: tweet.retweetCount || 0,
            reply_count: tweet.replyCount || 0,
            like_count: tweet.likeCount || 0,
            quote_count: tweet.quoteCount || 0,
            impression_count: tweet.viewCount || 0,
            bookmark_count: tweet.bookmarkCount || 0,
        },
    };
}

function mapUserToLegacy(user: any): Record<string, any> {
    return {
        id_str: user.id || '',
        name: user.name || '',
        screen_name: user.username || '',
        description: user.description || '',
        profile_image_url_https: user.profilePicture || '',
        verified: user.verified || false,
        public_metrics: {
            followers_count: user.followers || 0,
            following_count: user.following || 0,
            tweet_count: user.statusesCount || 0,
        },
    };
}

const init = () => {
    if (!getApiKey()) {
        logger.warn('Xquik API key not configured. Set XQUIK_API_KEY environment variable.');
    }
};

const getUser = async (username: string) => {
    const cleanUsername = username.replace(/^\+/, '').replace(/^@/, '');
    const data = await xquikGet(`/x/users/${cleanUsername}`);
    return mapUserToLegacy(data);
};

const getUserTweets = async (username: string, params: Record<string, any> = {}) => {
    const count = params.count || 20;
    const data = await xquikGet('/x/tweets/search', {
        q: `from:${username.replace(/^@/, '')} -is:retweet -is:reply`,
        limit: count,
        queryType: 'Latest',
    });
    return (data.tweets || []).map((t) => mapTweetToLegacy(t));
};

const getUserTweetsAndReplies = async (username: string, params: Record<string, any> = {}) => {
    const count = params.count || 20;
    const data = await xquikGet('/x/tweets/search', {
        q: `from:${username.replace(/^@/, '')} -is:retweet`,
        limit: count,
        queryType: 'Latest',
    });
    return (data.tweets || []).map((t) => mapTweetToLegacy(t));
};

const getUserMedia = async (username: string) => {
    const data = await xquikGet('/x/tweets/search', {
        q: `from:${username.replace(/^@/, '')} has:media -is:retweet`,
        limit: 20,
        queryType: 'Latest',
    });
    return (data.tweets || []).map((t) => mapTweetToLegacy(t));
};

const getUserLikes = (_username: string) => {
    // Xquik search API does not support fetching likes for a user
    logger.warn('getUserLikes is not supported by Xquik API, returning empty');
    return [];
};

const getUserTweet = async (tweetId: string) => {
    const data = await xquikGet(`/x/tweets/${tweetId}`);
    return mapTweetToLegacy(data);
};

const getSearch = async (keyword: string, params: Record<string, any> = {}) => {
    const count = params.count || 20;
    const data = await xquikGet('/x/tweets/search', {
        q: keyword,
        limit: count,
        queryType: 'Top',
    });
    return (data.tweets || []).map((t) => mapTweetToLegacy(t));
};

const getList = (_listId: string) => {
    // Xquik search API does not support fetching list tweets
    logger.warn('getList is not supported by Xquik API, returning empty');
    return [];
};

const getHomeTimeline = () => {
    logger.warn('getHomeTimeline is not supported by Xquik API, returning empty');
    return [];
};

const getHomeLatestTimeline = () => {
    logger.warn('getHomeLatestTimeline is not supported by Xquik API, returning empty');
    return [];
};

export default {
    init,
    getUser,
    getUserTweets,
    getUserTweetsAndReplies,
    getUserMedia,
    getUserLikes,
    getUserTweet,
    getSearch,
    getList,
    getHomeTimeline,
    getHomeLatestTimeline,
};
