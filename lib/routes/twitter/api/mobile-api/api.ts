import { baseUrl, gqlMap, gqlFeatures, consumerKey, consumerSecret } from './constants';
import { config } from '@/config';
import logger from '@/utils/logger';
import OAuth from 'oauth-1.0a';
import CryptoJS from 'crypto-js';
import queryString from 'query-string';
import { getToken } from './token';
import cache from '@/utils/cache';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import ofetch from '@/utils/ofetch';

const twitterGot = async (url, params) => {
    const token = await getToken();

    const oauth = new OAuth({
        consumer: {
            key: consumerKey,
            secret: consumerSecret,
        },
        signature_method: 'HMAC-SHA1',
        hash_function: (base_string, key) => CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64),
    });

    const requestData = {
        url: `${url}?${queryString.stringify(params)}`,
        method: 'GET',
        headers: {
            connection: 'keep-alive',
            'content-type': 'application/json',
            'x-twitter-active-user': 'yes',
            authority: 'api.x.com',
            'accept-encoding': 'gzip',
            'accept-language': 'en-US,en;q=0.9',
            accept: '*/*',
            DNT: '1',
        },
    };

    const response = await ofetch.raw(requestData.url, {
        headers: oauth.toHeader(oauth.authorize(requestData, token)),
    });
    if (response.status === 401) {
        cache.globalCache.set(token.cacheKey, '');
    }

    return response._data;
};

const paginationTweets = async (endpoint, userId, variables, path) => {
    const { data } = await twitterGot(baseUrl + endpoint, {
        variables: JSON.stringify({
            ...variables,
            rest_id: userId,
        }),
        features: gqlFeatures,
    });

    let instructions;
    if (path) {
        instructions = data;
        for (const p of path) {
            instructions = instructions[p];
        }
        instructions = instructions.instructions;
    } else {
        instructions = data.user_result.result.timeline_response.timeline.instructions;
    }

    return instructions.find((i) => i.__typename === 'TimelineAddEntries' || i.type === 'TimelineAddEntries').entries;
};

const timelineTweets = (userId, params = {}) =>
    paginationTweets(gqlMap.UserWithProfileTweets, userId, {
        ...params,
        withQuickPromoteEligibilityTweetFields: true,
    });

const timelineTweetsAndReplies = (userId, params = {}) =>
    paginationTweets(gqlMap.UserWithProfileTweetsAndReplies, userId, {
        ...params,
        count: 20,
    });

const timelineMedia = (userId, params = {}) => paginationTweets(gqlMap.MediaTimeline, userId, params);

// const timelineLikes = (userId, params = {}) => paginationTweets(gqlMap.Likes, userId, params);

const timelineKeywords = (keywords, params = {}) =>
    paginationTweets(
        gqlMap.SearchTimeline,
        null,
        {
            ...params,
            rawQuery: keywords,
            count: 20,
            product: 'Latest',
            withDownvotePerspective: false,
            withReactionsMetadata: false,
            withReactionsPerspective: false,
        },
        ['search_by_raw_query', 'search_timeline', 'timeline']
    );

const tweetDetail = (userId, params) =>
    paginationTweets(
        gqlMap.TweetDetail,
        userId,
        {
            ...params,
            includeHasBirdwatchNotes: false,
            includePromotedContent: false,
            withBirdwatchNotes: false,
            withVoice: false,
            withV2Timeline: true,
        },
        ['threaded_conversation_with_injections_v2']
    );

const listTweets = (listId, params = {}) =>
    paginationTweets(
        gqlMap.ListTimeline,
        listId,
        {
            ...params,
        },
        ['list', 'timeline_response', 'timeline']
    );

function gatherLegacyFromData(entries, filterNested, userId) {
    const tweets = [];
    const filteredEntries = [];
    for (const entry of entries) {
        const entryId = entry.entryId;
        if (entryId) {
            if (entryId.startsWith('tweet-')) {
                filteredEntries.push(entry);
            }
            if (filterNested && filterNested.some((f) => entryId.startsWith(f))) {
                filteredEntries.push(...entry.content.items);
            }
        }
    }
    for (const entry of filteredEntries) {
        if (entry.entryId) {
            const content = entry.content || entry.item;
            let tweet = content?.content?.tweetResult?.result || content?.itemContent?.tweet_results?.result;
            if (tweet && tweet.tweet) {
                tweet = tweet.tweet;
            }
            if (tweet) {
                const retweet = tweet.legacy?.retweeted_status_result?.result;
                for (const t of [tweet, retweet]) {
                    if (!t?.legacy) {
                        continue;
                    }
                    t.legacy.user = t.core?.user_result?.result?.legacy || t.core?.user_results?.result?.legacy;
                    t.legacy.id_str = t.rest_id; // avoid falling back to conversation_id_str elsewhere
                    const quote = t.quoted_status_result?.result;
                    if (quote) {
                        t.legacy.quoted_status = quote.legacy;
                        t.legacy.quoted_status.user = quote.core.user_result?.result?.legacy || quote.core.user_results?.result?.legacy;
                    }
                }
                const legacy = tweet.legacy;
                if (legacy) {
                    if (retweet) {
                        legacy.retweeted_status = retweet.legacy;
                    }
                    if (userId === undefined || legacy.user_id_str === userId + '') {
                        tweets.push(legacy);
                    }
                }
            }
        }
    }
    return tweets;
}

const getUserTweetsByID = async (id, params = {}) => gatherLegacyFromData(await timelineTweets(id, params));
// TODO: show the whole conversation instead of just the reply tweet
const getUserTweetsAndRepliesByID = async (id, params = {}) => gatherLegacyFromData(await timelineTweetsAndReplies(id, params), ['profile-conversation-'], id);
const getUserMediaByID = async (id, params = {}) => gatherLegacyFromData(await timelineMedia(id, params));
// const getUserLikesByID = async (id, params = {}) => gatherLegacyFromData(await timelineLikes(id, params));
const getUserTweetByStatus = async (id, params = {}) => gatherLegacyFromData(await tweetDetail(id, params), ['homeConversation-', 'conversationthread-']);
const getListById = async (id, params = {}) => gatherLegacyFromData(await listTweets(id, params));

const excludeRetweet = function (tweets) {
    const excluded = [];
    for (const t of tweets) {
        if (t.retweeted_status) {
            continue;
        }
        excluded.push(t);
    }
    return excluded;
};

const userByScreenName = (screenName) =>
    twitterGot(`${baseUrl}${gqlMap.UserResultByScreenName}`, {
        variables: `{"screen_name":"${screenName}","withHighlightedLabel":true}`,
        features: gqlFeatures,
    });
const userByRestId = (restId) =>
    twitterGot(`${baseUrl}${gqlMap.UserByRestId}`, {
        variables: `{"userId":"${restId}","withHighlightedLabel":true}`,
        features: gqlFeatures,
    });
const userByAuto = (id) => {
    if (id.startsWith('+')) {
        return userByRestId(id.slice(1));
    }
    return userByScreenName(id);
};
const getUserData = (id) => cache.tryGet(`twitter-userdata-${id}`, () => userByAuto(id));
const getUserID = async (id) => {
    const userData = await getUserData(id);
    return (userData.data?.user || userData.data?.user_result)?.result?.rest_id;
};
const getUser = async (id) => {
    const userData = await getUserData(id);
    return (userData.data?.user || userData.data?.user_result)?.result?.legacy;
};

const cacheTryGet = async (_id, params, func) => {
    const id = await getUserID(_id);
    if (id === undefined) {
        throw new InvalidParameterError('User not found');
    }
    const funcName = func.name;
    const paramsString = JSON.stringify(params);
    return cache.tryGet(`twitter:${id}:${funcName}:${paramsString}`, () => func(id, params), config.cache.routeExpire, false);
};

// returns:
// 1. nothing for some users
// 2. HOT tweets for the other users, instead of the LATEST ones
const _getUserTweets = (id, params = {}) => cacheTryGet(id, params, getUserTweetsByID);
// workaround for the above issue:
// 1. getUserTweetsAndReplies return LATEST tweets and replies, which requires filtering
//    a. if one replies a lot (e.g. elonmusk), there is sometimes no tweets left after filtering, caching may help
// 2. getUserMedia return LATEST media tweets, which is a good plus
const getUserTweets = async (id, params = {}) => {
    let tweets = [];
    const rest_id = await getUserID(id);
    await Promise.all(
        [_getUserTweets, getUserTweetsAndReplies, getUserMedia].map(async (func) => {
            try {
                tweets.push(...(await func(id, params)));
            } catch (error) {
                logger.warn(`Failed to get tweets for ${id} with ${func.name}: ${error}`);
            }
        })
    );

    const cacheKey = `twitter:user:tweets-cache:${rest_id}`;
    let cacheValue = await cache.get(cacheKey);
    if (cacheValue) {
        cacheValue = JSON.parse(cacheValue);
        if (cacheValue && cacheValue.length) {
            tweets = [...cacheValue, ...tweets];
        }
    }
    const idSet = new Set();
    tweets = tweets
        .filter(
            (tweet) =>
                !tweet.in_reply_to_user_id_str || // exclude replies
                tweet.in_reply_to_user_id_str === rest_id // but include replies to self (threads)
        )
        .map((tweet) => {
            const id_str = tweet.id_str || tweet.conversation_id_str;
            return !idSet.has(id_str) && idSet.add(id_str) && tweet;
        }) // deduplicate
        .filter(Boolean) // remove null
        .sort((a, b) => (b.id_str || b.conversation_id_str) - (a.id_str || a.conversation_id_str)) // desc
        .slice(0, 20);
    cache.set(cacheKey, JSON.stringify(tweets));
    return tweets;
};
const getUserTweetsAndReplies = (id, params = {}) => cacheTryGet(id, params, getUserTweetsAndRepliesByID);
const getUserMedia = (id, params = {}) => cacheTryGet(id, params, getUserMediaByID);
// const getUserLikes = (id, params = {}) => cacheTryGet(id, params, getUserLikesByID);
const getUserTweet = (id, params) => cacheTryGet(id, params, getUserTweetByStatus);

const getSearch = async (keywords, params = {}) => gatherLegacyFromData(await timelineKeywords(keywords, params));

const getList = (id, params = {}) => cache.tryGet(`twitter:${id}:getListById:${JSON.stringify(params)}`, () => getListById(id, params), config.cache.routeExpire, false);

export default {
    getUser,
    getUserTweets,
    getUserTweetsAndReplies,
    getUserMedia,
    // getUserLikes,
    excludeRetweet,
    getSearch,
    getList,
    getUserTweet,
    init: () => void 0,
};
