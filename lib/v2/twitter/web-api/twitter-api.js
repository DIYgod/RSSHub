const { baseUrl, gqlMap, gqlFeatures, consumerKey, consumerSecret } = require('./constants');
const config = require('@/config').value;
const logger = require('@/utils/logger');
const got = require('@/utils/got');
const OAuth = require('oauth-1.0a');
const CryptoJS = require('crypto-js');
const queryString = require('query-string');

let tokenIndex = 0;

const twitterGot = async (url, params) => {
    if (!config.twitter.oauthTokens?.length || !config.twitter.oauthTokenSecrets?.length || config.twitter.oauthTokens.length !== config.twitter.oauthTokenSecrets.length) {
        throw Error('Invalid twitter oauth tokens');
    }

    const oauth = OAuth({
        consumer: {
            key: consumerKey,
            secret: consumerSecret,
        },
        signature_method: 'HMAC-SHA1',
        hash_function: (base_string, key) => CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64),
    });

    const token = {
        key: config.twitter.oauthTokens[tokenIndex],
        secret: config.twitter.oauthTokenSecrets[tokenIndex],
    };
    tokenIndex++;
    if (tokenIndex >= config.twitter.oauthTokens.length) {
        tokenIndex = 0;
    }

    const requestData = {
        url: `${url}?${queryString.stringify(params)}`,
        method: 'GET',
        headers: {
            connection: 'keep-alive',
            'content-type': 'application/json',
            'x-twitter-active-user': 'yes',
            authority: 'api.twitter.com',
            'accept-encoding': 'gzip',
            'accept-language': 'en-US,en;q=0.9',
            accept: '*/*',
            DNT: '1',
        },
    };

    const response = await got(requestData.url, {
        headers: oauth.toHeader(oauth.authorize(requestData, token)),
    });

    return response.data;
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
    if (!path) {
        instructions = data.user_result.result.timeline_response.timeline.instructions;
    } else {
        instructions = data;
        path.forEach((p) => (instructions = instructions[p]));
        instructions = instructions.instructions;
    }

    return instructions.filter((i) => i.__typename === 'TimelineAddEntries' || i.type === 'TimelineAddEntries')[0].entries;
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

function gatherLegacyFromData(entries, filterNested = undefined, userId = undefined) {
    const tweets = [];
    const filteredEntries = [];
    entries.forEach((entry) => {
        const entryId = entry.entryId;
        if (entryId) {
            if (entryId.startsWith('tweet-')) {
                filteredEntries.push(entry);
            }
            if (filterNested && filterNested.some((f) => entryId.startsWith(f))) {
                filteredEntries.push(...entry.content.items);
            }
        }
    });
    filteredEntries.forEach((entry) => {
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
    });
    return tweets;
}

const getUserTweetsByID = async (id, params = {}) => gatherLegacyFromData(await timelineTweets(id, params));
// TODO: show the whole conversation instead of just the reply tweet
const getUserTweetsAndRepliesByID = async (id, params = {}) => gatherLegacyFromData(await timelineTweetsAndReplies(id, params), ['profile-conversation-'], id);
const getUserMediaByID = async (id, params = {}) => gatherLegacyFromData(await timelineMedia(id, params));
// const getUserLikesByID = async (id, params = {}) => gatherLegacyFromData(await timelineLikes(id, params));
const getUserTweetByStatus = async (id, params = {}) => gatherLegacyFromData(await tweetDetail(id, params), ['homeConversation-', 'conversationthread-']);

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
const getUserData = (cache, id) => cache.tryGet(`twitter-userdata-${id}`, () => userByAuto(id));
const getUserID = async (cache, id) => {
    const userData = await getUserData(cache, id);
    return (userData.data?.user || userData.data?.user_result)?.result?.rest_id;
};
const getUser = async (cache, id) => {
    const userData = await getUserData(cache, id);
    return (userData.data?.user || userData.data?.user_result)?.result?.legacy;
};

const cacheTryGet = async (cache, _id, params, func) => {
    const id = await getUserID(cache, _id);
    if (id === undefined) {
        throw Error('User not found');
    }
    const funcName = func.name;
    const paramsString = JSON.stringify(params);
    return cache.tryGet(`twitter:${id}:${funcName}:${paramsString}`, () => func(id, params), config.cache.routeExpire, false);
};

// returns:
// 1. nothing for some users
// 2. HOT tweets for the other users, instead of the LATEST ones
const _getUserTweets = (cache, id, params = {}) => cacheTryGet(cache, id, params, getUserTweetsByID);
// workaround for the above issue:
// 1. getUserTweetsAndReplies return LATEST tweets and replies, which requires filtering
//    a. if one replies a lot (e.g. elonmusk), there is sometimes no tweets left after filtering, caching may help
// 2. getUserMedia return LATEST media tweets, which is a good plus
const getUserTweets = async (cache, id, params = {}) => {
    let tweets = [];
    const rest_id = await getUserID(cache, id);
    await Promise.all(
        [_getUserTweets, getUserTweetsAndReplies, getUserMedia].map(async (func) => {
            try {
                tweets.push(...(await func(cache, id, params)));
            } catch (e) {
                logger.warn(`Failed to get tweets for ${id} with ${func.name}: ${e}`);
            }
        })
    );

    const cacheKey = `twitter:user:tweets-cache:${rest_id}`;
    let cacheValue = await cache.get(cacheKey);
    if (cacheValue) {
        cacheValue = JSON.parse(cacheValue);
        if (cacheValue && cacheValue.length) {
            tweets = cacheValue.concat(tweets);
        }
    }
    const idSet = new Set();
    tweets = tweets
        .filter((tweet) => !tweet.in_reply_to_screen_name) // exclude replies
        .map((tweet) => (idSet.has(tweet.id_str) ? null : idSet.add(tweet.id_str)) && tweet) // deduplicate
        .filter(Boolean) // remove null
        .sort((a, b) => b.id_str - a.id_str) // desc
        .slice(0, 20);
    cache.set(cacheKey, JSON.stringify(tweets));
    return tweets;
};
const getUserTweetsAndReplies = (cache, id, params = {}) => cacheTryGet(cache, id, params, getUserTweetsAndRepliesByID);
const getUserMedia = (cache, id, params = {}) => cacheTryGet(cache, id, params, getUserMediaByID);
// const getUserLikes = (cache, id, params = {}) => cacheTryGet(cache, id, params, getUserLikesByID);
const getUserTweet = (cache, id, params) => cacheTryGet(cache, id, params, getUserTweetByStatus);

const getSearch = async (keywords, params = {}) => gatherLegacyFromData(await timelineKeywords(keywords, params));

module.exports = {
    getUser,
    getUserTweets,
    getUserTweetsAndReplies,
    getUserMedia,
    // getUserLikes,
    excludeRetweet,
    getSearch,
    getUserTweet,
};
