import type { TwitterApiReadOnly } from 'twitter-api-v2';
import { TwitterApi } from 'twitter-api-v2';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';

const appClients: TwitterApiReadOnly[] = [];
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

    for (const [index, consumerKey] of consumerKeys.entries()) {
        const consumerSecret = consumerSecrets[index];
        if (!consumerKey || !consumerSecret) {
            continue;
        }
        appClients.push(
            new TwitterApi({
                appKey: consumerKey,
                appSecret: consumerSecret,
            }).readOnly
        );
    }
};

export const getAppClient = async () => {
    init();
    if (!appClients.length) {
        throw new ConfigNotFoundError('Twitter API is not configured');
    }
    index += 1;
    return await appClients[index % appClients.length].appLogin();
};

const mapUserToLegacy = (user: Record<string, any>) =>
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

const mapUrlsToLegacy = (urls: Array<Record<string, any>> = []) =>
    urls.map((url) => ({
        url: url.url,
        expanded_url: url.expanded_url ?? url.unwound_url ?? url.url,
        display_url: url.display_url ?? url.url,
    }));

const mapHashtagsToLegacy = (hashtags: Array<Record<string, any>> = []) => hashtags.map((hashtag) => ({ text: hashtag.tag }));

const mapMentionsToLegacy = (mentions: Array<Record<string, any>> = []) =>
    mentions.map((mention) => ({
        id_str: mention.id,
        screen_name: mention.username,
        name: mention.username,
    }));

const mapMediaToLegacy = (media: Record<string, any>) => {
    const url = media.url ?? media.preview_image_url;
    const mapped = {
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
    } as Record<string, any>;

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

const mapTweetToLegacy = (tweet: Record<string, any>, includes: Record<string, any> | undefined, cacheMap: Map<string, Record<string, any>>) => {
    if (cacheMap.has(tweet.id)) {
        return cacheMap.get(tweet.id);
    }

    const users = new Map((includes?.users ?? []).map((user) => [user.id, user]));
    const tweets = new Map((includes?.tweets ?? []).map((item) => [item.id, item]));
    const media = new Map((includes?.media ?? []).map((item) => [item.media_key, item]));

    const user = users.get(tweet.author_id);
    const legacyUser = mapUserToLegacy(user);
    const legacy: Record<string, any> = {
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
                .filter(Boolean)
                .map((item) => mapMediaToLegacy(item)),
        },
        user: legacyUser,
        user_id_str: tweet.author_id,
        in_reply_to_user_id_str: tweet.in_reply_to_user_id,
    };

    cacheMap.set(tweet.id, legacy);

    for (const reference of tweet.referenced_tweets ?? []) {
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
                const replyUser = users.get(referenced.author_id);
                legacy.in_reply_to_screen_name = replyUser?.username;

                break;
            }
            default:
            // Do nothing
        }
    }

    if (!legacy.extended_entities.media?.length) {
        delete legacy.extended_entities;
    }

    return legacy;
};

const mapTweetResponseToLegacy = (response: Record<string, any>) => {
    const cacheMap = new Map<string, Record<string, any>>();
    return (response?.data ?? []).map((tweet) => mapTweetToLegacy(tweet, response.includes, cacheMap));
};

const getUserData = (id: string) =>
    cache.tryGet(`twitter-userdata-${id}`, async () => {
        const client = await getAppClient();
        const params = {
            'user.fields': 'profile_image_url,description,verified,url',
        };
        const response = id.startsWith('+') ? await client.v2.user(id.slice(1), params) : await client.v2.userByUsername(id, params);
        return mapUserToLegacy(response?.data);
    });

const cacheTryGet = async (_id: string, params: Record<string, any> | undefined, func: (id: string, params?: Record<string, any>) => Promise<any>) => {
    const userData: any = await getUserData(_id);
    const id = userData?.id_str;
    if (id === undefined) {
        cache.set(`twitter-userdata-${_id}`, '', config.cache.contentExpire);
        throw new InvalidParameterError('User not found');
    }
    const funcName = func.name;
    const paramsString = JSON.stringify(params);
    return cache.tryGet(`twitter:${id}:${funcName}:${paramsString}`, () => func(id, params), config.cache.routeExpire, false);
};

const getUserTimeline = async (id: string, params?: Record<string, any>, options: Record<string, any> = {}) => {
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

const getUserTweets = (id: string, params?: Record<string, any>) => cacheTryGet(id, params, (id, params = {}) => getUserTimeline(id, params, { exclude: 'replies' }));

const getUserTweetsAndReplies = (id: string, params?: Record<string, any>) => cacheTryGet(id, params, (id, params = {}) => getUserTimeline(id, params));

const getUserMedia = (id: string, params?: Record<string, any>) =>
    cacheTryGet(id, params, async (id, params = {}) => {
        const data = await getUserTimeline(id, params);
        return data.filter((tweet) => tweet.extended_entities?.media);
    });

const getUserLikes = (id: string, params?: Record<string, any>) =>
    cacheTryGet(id, params, async (id, params = {}) => {
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

const getUserTweet = (id: string, params?: Record<string, any>) =>
    cacheTryGet(id, params, async (_id, params = {}) => {
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

const getSearch = (keywords: string, params?: Record<string, any>) =>
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

const getList = (id: string, params?: Record<string, any>) =>
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

const getHomeTimeline = (_id: string, params?: Record<string, any>) =>
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

const getHomeLatestTimeline = (id: string, params?: Record<string, any>) => getHomeTimeline(id, params);

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
