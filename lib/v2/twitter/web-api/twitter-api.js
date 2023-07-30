const twitterGot = require('./twitter-got');
const { graphQLMap, featuresMap, auth } = require('./constants');
const config = require('@/config').value;
const got = require('@/utils/got');
const logger = require('@/utils/logger');

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L727-L755
const _params = {
    count: 20,
    include_profile_interstitial_type: 1,
    include_blocking: 1,
    include_blocked_by: 1,
    include_followed_by: 1,
    include_want_retweets: 1,
    include_mute_edge: 1,
    include_can_dm: 1,
    include_can_media_tag: 1,
    include_ext_has_nft_avatar: 1,
    skip_status: 1,
    cards_platform: 'Web-12',
    include_cards: 1,
    include_ext_alt_text: true,
    include_quote_count: true,
    include_reply_count: 1,
    tweet_mode: 'extended',
    include_entities: true,
    include_user_entities: true,
    include_ext_media_color: true,
    include_ext_media_availability: true,
    // include_ext_sensitive_media_warning: true,  // IDK what it is, maybe disabling it will make NSFW lovers happy?
    send_error_codes: true,
    simple_quoted_tweet: true,
    include_tweet_replies: false,
    cursor: undefined,
    ext: 'mediaStats,highlightedLabel,hasNftAvatar,voiceInfo,superFollowMetadata',
};

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L756--L770
const _variables = {
    count: 20,
    includePromotedContent: false,
    withSuperFollowsUserFields: true,
    withBirdwatchPivots: false,
    withDownvotePerspective: false,
    withReactionsMetadata: false,
    withReactionsPerspective: false,
    withSuperFollowsTweetFields: true,
    withClientEventToken: false,
    withBirdwatchNotes: false,
    withVoice: true,
    withV2Timeline: false,
    __fs_interactive_text: false,
    __fs_dont_mention_me_view_api_enabled: false,
};

// const paginationLegacy = (endpoint, userId, params) =>
//     twitterGot('https://api.twitter.com' + endpoint, {
//         ..._params,
//         ...params,
//         userId,
//     });

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L1075-L1093
const paginationTweets = async (endpoint, userId, variables, path) => {
    const { data } = await twitterGot('https://twitter.com/i/api' + endpoint, {
        variables: JSON.stringify({
            ..._variables,
            ...variables,
            userId,
        }),
        features: featuresMap.UserTweets,
    });

    let instructions;
    if (!path) {
        instructions = data.user.result.timeline.timeline.instructions;
    } else {
        instructions = data;
        path.forEach((p) => (instructions = instructions[p]));
        instructions = instructions.instructions;
    }

    return instructions.filter((i) => i.type === 'TimelineAddEntries')[0].entries;
};

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L807-L814
const timelineTweets = (userId, params = {}) =>
    paginationTweets(graphQLMap.UserTweets, userId, {
        ...params,
        withQuickPromoteEligibilityTweetFields: true,
    });

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L816-L823
const timelineTweetsAndReplies = (userId, params = {}) =>
    paginationTweets(graphQLMap.UserTweetsAndReplies, userId, {
        ...params,
        withCommunity: true,
    });

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L825-L831
const timelineMedia = (userId, params = {}) => paginationTweets(graphQLMap.UserMedia, userId, params);

// this query requires login
// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L833-L839
const timelineLikes = (userId, params = {}) => paginationTweets(graphQLMap.Likes, userId, params);

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L858-L866
const timelineKeywords = (keywords, params = {}) =>
    got('https://api.twitter.com/1.1/search/universal.json', {
        headers: {
            Authorization: auth,
        },
        searchParams: {
            ..._params,
            ...params,
            q: keywords,
            modules: 'status',
            result_type: 'recent',
        },
    });

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L795-L805
const tweetDetail = (userId, params) =>
    paginationTweets(
        graphQLMap.TweetDetail,
        userId,
        {
            ...params,
            with_rux_injections: false,
            withCommunity: true,
            withQuickPromoteEligibilityTweetFields: false,
            withBirdwatchNotes: false,
        },
        ['threaded_conversation_with_injections']
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
            let tweet = content?.itemContent?.tweet_results?.result;
            if (tweet && tweet.tweet) {
                tweet = tweet.tweet;
            }
            if (tweet) {
                const retweet = tweet.legacy?.retweeted_status_result?.result;
                for (const t of [tweet, retweet]) {
                    if (!t?.legacy) {
                        continue;
                    }
                    t.legacy.user = t.core.user_results.result.legacy;
                    const quote = t.quoted_status_result?.result;
                    if (quote) {
                        t.legacy.quoted_status = quote.legacy;
                        t.legacy.quoted_status.user = quote.core.user_results.result.legacy;
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
const getUserLikesByID = async (id, params = {}) => gatherLegacyFromData(await timelineLikes(id, params));
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
    twitterGot(`https://twitter.com/i/api${graphQLMap.UserByScreenName}`, {
        variables: `{"screen_name":"${screenName}","withHighlightedLabel":true}`,
        features: featuresMap.UserByScreenName,
    });
const userByRestId = (restId) =>
    twitterGot(`https://twitter.com/i/api${graphQLMap.UserByRestId}`, {
        variables: `{"userId":"${restId}","withHighlightedLabel":true}`,
        features: featuresMap.UserByRestId,
    });
const userByAuto = (id) => {
    if (id.startsWith('+')) {
        return userByRestId(id.slice(1));
    }
    return userByScreenName(id);
};
const getUserData = (cache, id) => cache.tryGet(`twitter-userdata-${id}`, () => userByAuto(id));
const getUserID = async (cache, id) => (await getUserData(cache, id)).data.user.result.rest_id;
const getUser = async (cache, id) => (await getUserData(cache, id)).data.user.result.legacy;

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
const getUserLikes = (cache, id, params = {}) => cacheTryGet(cache, id, params, getUserLikesByID);
const getUserTweet = (cache, id, params) => cacheTryGet(cache, id, params, getUserTweetByStatus);

const getSearch = async (keywords, params = {}) => (await timelineKeywords(keywords, params)).data.modules.map((module) => module.status.data);

module.exports = {
    getUser,
    getUserTweets,
    getUserTweetsAndReplies,
    getUserMedia,
    getUserLikes,
    excludeRetweet,
    getSearch,
    getUserTweet,
};
