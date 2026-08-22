import type { ApiV2Includes, MediaObjectV2, TweetEntityHashtagV2, TweetEntityMentionV2, TweetEntityUrlV2, TweetV2, TwitterApiReadOnly, UserV2 } from 'twitter-api-v2';
import { TwitterApi } from 'twitter-api-v2';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';

import { getTwitterUserCacheKey } from '../../utils';

interface ClientWrapper {
    client: TwitterApiReadOnly;
    isUserAuth: boolean;
}

interface LegacyUser {
    id_str: string;
    name: string;
    screen_name: string;
    description?: string;
    profile_image_url?: string;
    profile_image_url_https?: string;
    url?: string;
    verified?: boolean;
}

interface LegacyMedia {
    id_str: string;
    type: string;
    media_url_https?: string;
    media_url?: string;
    url?: string;
    sizes: {
        large: {
            w: number;
            h: number;
            resize: string;
        };
    };
    video_info?: {
        variants: Array<{
            bitrate?: number;
            content_type: string;
            url: string;
        }>;
    };
}

interface LegacyTweet {
    id_str: string;
    conversation_id_str?: string;
    full_text: string;
    text: string;
    created_at?: string;
    entities: {
        urls: Array<{ url: string; expanded_url: string; display_url: string }>;
        hashtags: Array<{ text: string }>;
        user_mentions: Array<{ id_str: string; screen_name: string; name: string }>;
        symbols: never[];
    };
    extended_entities?: {
        media: LegacyMedia[];
    };
    user: LegacyUser | null;
    user_id_str?: string;
    in_reply_to_user_id_str?: string;
    in_reply_to_status_id_str?: string;
    in_reply_to_screen_name?: string;
    retweeted_status?: LegacyTweet;
    quoted_status?: LegacyTweet;
}

type DevApiParams = Record<string, string | number | boolean | undefined>;

interface TweetsV2Response {
    data?: TweetV2[];
    includes?: ApiV2Includes;
}

const appClients: ClientWrapper[] = [];
let index = -1;

const init = () => {
    if (appClients.length) {
        return;
    }
    if (!config.twitter.consumerKey || !config.twitter.consumerSecret) {
        return;
    }

    const consumerKeys = config.twitter.consumerKey.split(',');
    const consumerSecrets = config.twitter.consumerSecret.split(',');
    const accessTokens = config.twitter.accessToken?.split(',') || [];
    const accessSecrets = config.twitter.accessSecret?.split(',') || [];

    for (const [index, consumerKey] of consumerKeys.entries()) {
        const consumerSecret = consumerSecrets[index];
        const accessToken = accessTokens[index];
        const accessSecret = accessSecrets[index];

        if (!consumerKey || !consumerSecret) {
            continue;
        }

        if (accessToken && accessSecret) {
            appClients.push({
                client: new TwitterApi({
                    appKey: consumerKey,
                    appSecret: consumerSecret,
                    accessToken,
                    accessSecret,
                }).readOnly,
                isUserAuth: true,
            });
        } else {
            appClients.push({
                client: new TwitterApi({
                    appKey: consumerKey,
                    appSecret: consumerSecret,
                }).readOnly,
                isUserAuth: false,
            });
        }
    }
};

export const getAppClient = async () => {
    init();
    if (!appClients.length) {
        throw new ConfigNotFoundError('Twitter API is not configured');
    }
    index += 1;

    const currentWrapper = appClients[index % appClients.length];

    return currentWrapper.isUserAuth ? currentWrapper.client : await currentWrapper.client.appLogin();
};

const mapUserToLegacy = (user: UserV2 | undefined): LegacyUser | null =>
    user
        ? {
              id_str: user.id,
              name: user.name,
              screen_name: user.username,
              description: user.description,
              profile_image_url: user.profile_image_url,
              profile_image_url_https: user.profile_image_url,
              url: user.url,
              verified: user.verified,
          }
        : null;

const mapUrlsToLegacy = (urls: TweetEntityUrlV2[] = []) =>
    urls.map((url) => ({
        url: url.url,
        expanded_url: url.expanded_url ?? url.unwound_url ?? url.url,
        display_url: url.display_url ?? url.url,
    }));

const mapHashtagsToLegacy = (hashtags: TweetEntityHashtagV2[] = []) => hashtags.map((hashtag) => ({ text: hashtag.tag }));

const mapMentionsToLegacy = (mentions: TweetEntityMentionV2[] = []) =>
    mentions.map((mention) => ({
        id_str: mention.id,
        screen_name: mention.username,
        name: mention.username,
    }));

const mapMediaToLegacy = (media: MediaObjectV2) => {
    const url = media.url ?? media.preview_image_url;
    const mapped: LegacyMedia = {
        id_str: media.media_key,
        type: media.type,
        media_url_https: url,
        media_url: url,
        url,
        sizes: {
            large: {
                w: media.width ?? 0,
                h: media.height ?? 0,
                resize: 'fit',
            },
        },
    };

    if (media.variants?.length) {
        mapped.video_info = {
            variants: media.variants.map((variant) => ({
                bitrate: variant.bit_rate,
                content_type: variant.content_type,
                url: variant.url,
            })),
        };
    }

    return mapped;
};

const mapTweetToLegacy = (tweet: TweetV2, includes: ApiV2Includes | undefined, cacheMap: Map<string, LegacyTweet>): LegacyTweet => {
    const cached = cacheMap.get(tweet.id);
    if (cached) {
        return cached;
    }

    const users = new Map((includes?.users ?? []).map((user) => [user.id, user]));
    const tweets = new Map((includes?.tweets ?? []).map((item) => [item.id, item]));
    const media = new Map((includes?.media ?? []).map((item) => [item.media_key, item]));

    const user = users.get(tweet.author_id!);
    const legacyUser = mapUserToLegacy(user);
    const legacy: LegacyTweet = {
        id_str: tweet.id,
        conversation_id_str: tweet.conversation_id,
        full_text: tweet.text,
        text: tweet.text,
        created_at: tweet.created_at,
        entities: {
            urls: mapUrlsToLegacy(tweet.entities?.urls),
            hashtags: mapHashtagsToLegacy(tweet.entities?.hashtags),
            user_mentions: mapMentionsToLegacy(tweet.entities?.mentions),
            symbols: [],
        },
        extended_entities: {
            media: (tweet.attachments?.media_keys ?? [])
                .map((key) => media.get(key))
                .filter((item) => item !== undefined)
                .map((item) => mapMediaToLegacy(item)),
        },
        user: legacyUser,
        user_id_str: tweet.author_id,
        in_reply_to_user_id_str: tweet.in_reply_to_user_id,
    };

    cacheMap.set(tweet.id, legacy);

    const referencedTweets = tweet.referenced_tweets ?? [];
    for (const reference of referencedTweets) {
        const referenced = tweets.get(reference.id);
        if (!referenced) {
            continue;
        }
        const mappedReferenced = mapTweetToLegacy(referenced, includes, cacheMap);
        switch (reference.type) {
            case 'retweeted':
                legacy.retweeted_status = mappedReferenced;
                break;

            case 'quoted':
                legacy.quoted_status = mappedReferenced;
                break;

            case 'replied_to': {
                legacy.in_reply_to_status_id_str = reference.id;
                legacy.in_reply_to_user_id_str = referenced.author_id;
                const replyUser = users.get(referenced.author_id!);
                legacy.in_reply_to_screen_name = replyUser?.username;

                break;
            }
            default:
            // Do nothing
        }
    }

    if (!legacy.extended_entities?.media.length) {
        delete legacy.extended_entities;
    }

    return legacy;
};

const mapTweetResponseToLegacy = (response: TweetsV2Response) => {
    const cacheMap = new Map<string, LegacyTweet>();
    return (response?.data ?? []).map((tweet) => mapTweetToLegacy(tweet, response.includes, cacheMap));
};

const getUserData = (id: string) =>
    cache.tryGet(`twitter-userdata-${id}`, async () => {
        const client = await getAppClient();
        const params = {
            'user.fields': 'profile_image_url,description,verified,url',
        };
        const response = id.startsWith('+') ? await client.v2.user(id.slice(1), params) : await client.v2.userByUsername(id, params);
        return mapUserToLegacy(response?.data) ?? '';
    });

const cacheTryGet = async (_id: string, params: DevApiParams | undefined, operationName: string, func: (id: string, params?: DevApiParams) => Promise<LegacyTweet[]>) => {
    const userData: any = await getUserData(_id);
    const id = userData?.id_str;
    if (id === undefined) {
        cache.set(`twitter-userdata-${_id}`, '', config.cache.contentExpire);
        throw new InvalidParameterError('User not found');
    }
    return cache.tryGet(getTwitterUserCacheKey(id, operationName, params), () => func(id, params), config.cache.routeExpire, false);
};

const getUserTimeline = async (id: string, params?: DevApiParams, options: DevApiParams = {}) => {
    const client = await getAppClient();
    const response = await client.v2.get(`users/${id}/tweets`, {
        max_results: params?.count ?? 20,
        expansions: 'author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id',
        'tweet.fields': 'created_at,entities,conversation_id,referenced_tweets,author_id,in_reply_to_user_id',
        'user.fields': 'username,name,profile_image_url,description',
        'media.fields': 'preview_image_url,url,type,width,height,variants',
        ...options,
    });
    return mapTweetResponseToLegacy(response);
};

const getUserTweets = (id: string, params?: DevApiParams) => cacheTryGet(id, params, 'getUserTweets', (id, params = {}) => getUserTimeline(id, params, { exclude: 'replies' }));

const getUserTweetsAndReplies = (id: string, params?: DevApiParams) => cacheTryGet(id, params, 'getUserTweetsAndReplies', (id, params = {}) => getUserTimeline(id, params));

const getUserMedia = (id: string, params?: DevApiParams) =>
    cacheTryGet(id, params, 'getUserMedia', async (id, params = {}) => {
        const data = await getUserTimeline(id, params);
        return data.filter((tweet) => tweet.extended_entities?.media);
    });

const getUserLikes = (id: string, params?: DevApiParams) =>
    cacheTryGet(id, params, 'getUserLikes', async (id, params = {}) => {
        const client = await getAppClient();
        const response = await client.v2.get(`users/${id}/liked_tweets`, {
            max_results: params.count ?? 20,
            expansions: 'author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id',
            'tweet.fields': 'created_at,entities,conversation_id,referenced_tweets,author_id,in_reply_to_user_id',
            'user.fields': 'username,name,profile_image_url,description',
            'media.fields': 'preview_image_url,url,type,width,height,variants',
        });
        return mapTweetResponseToLegacy(response);
    });

const getUserTweet = (id: string, params?: DevApiParams) =>
    cacheTryGet(id, params, 'getUserTweet', async (_id, params = {}) => {
        const client = await getAppClient();
        const tweetId = params.focalTweetId;
        if (!tweetId) {
            throw new InvalidParameterError('Tweet ID is required');
        }
        const response = await client.v2.get(`tweets/${tweetId}`, {
            expansions: 'author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id',
            'tweet.fields': 'created_at,entities,conversation_id,referenced_tweets,author_id,in_reply_to_user_id',
            'user.fields': 'username,name,profile_image_url,description',
            'media.fields': 'preview_image_url,url,type,width,height,variants',
        });
        return mapTweetResponseToLegacy({ data: response?.data ? [response.data] : [], includes: response?.includes });
    });

const getSearch = (keywords: string, params?: DevApiParams) =>
    cache.tryGet(
        `twitter:search:${keywords}:${JSON.stringify(params)}`,
        async () => {
            const client = await getAppClient();
            const response = await client.v2.get('tweets/search/recent', {
                query: keywords,
                max_results: params?.count ?? 20,
                expansions: 'author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id',
                'tweet.fields': 'created_at,entities,conversation_id,referenced_tweets,author_id,in_reply_to_user_id',
                'user.fields': 'username,name,profile_image_url,description',
                'media.fields': 'preview_image_url,url,type,width,height,variants',
            });
            return mapTweetResponseToLegacy(response);
        },
        config.cache.routeExpire,
        false
    );

const getList = (id: string, params?: DevApiParams) =>
    cache.tryGet(
        `twitter:list:${id}:${JSON.stringify(params)}`,
        async () => {
            const client = await getAppClient();
            const response = await client.v2.get(`lists/${id}/tweets`, {
                max_results: params?.count ?? 20,
                expansions: 'author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id',
                'tweet.fields': 'created_at,entities,conversation_id,referenced_tweets,author_id,in_reply_to_user_id',
                'user.fields': 'username,name,profile_image_url,description',
                'media.fields': 'preview_image_url,url,type,width,height,variants',
            });
            return mapTweetResponseToLegacy(response);
        },
        config.cache.routeExpire,
        false
    );

const getHomeTimeline = (_id: string, params?: DevApiParams) =>
    cache.tryGet(
        `twitter:home:${JSON.stringify(params)}`,
        async () => {
            if (!_id) {
                throw new InvalidParameterError('User ID is required for the v2 home timeline');
            }
            const client = await getAppClient();
            const response = await client.v2.get(`users/${_id}/timelines/reverse_chronological`, {
                max_results: params?.count ?? 20,
                expansions: 'author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id',
                'tweet.fields': 'created_at,entities,conversation_id,referenced_tweets,author_id,in_reply_to_user_id',
                'user.fields': 'username,name,profile_image_url,description',
                'media.fields': 'preview_image_url,url,type,width,height,variants',
            });
            return mapTweetResponseToLegacy(response);
        },
        config.cache.routeExpire,
        false
    );

const getHomeLatestTimeline = (id: string, params?: DevApiParams) => getHomeTimeline(id, params);

const getUser = (id: string) => getUserData(id);

export default {
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
    init,
};
