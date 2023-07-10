const twitterGot = require('./twitter-got');
const { graphQLMap, featuresMap } = require('./constants');
const config = require('@/config').value;

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
    twitterGot('https://twitter.com/i/api/2/search/adaptive.json', {
        ..._params,
        ...params,
        q: keywords,
        tweet_search_mode: 'live',
        query_source: 'typed_query',
        pc: 1,
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

function gatherLegacyFromData(entries, filter = 'tweet-') {
    const tweets = [];
    const filte_entries = [];
    entries.forEach((entry) => {
        const entryId = entry.entryId;
        if (entryId) {
            if (filter === 'none') {
                if (entryId.startsWith('tweet-')) {
                    filte_entries.push(entry);
                } else if (entryId.startsWith('homeConversation-') || entryId.startsWith('conversationthread-')) {
                    filte_entries.push(...entry.content.items);
                }
            } else {
                if (entryId.startsWith(filter)) {
                    filte_entries.push(entry);
                }
            }
        }
    });
    filte_entries.forEach((entry) => {
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
                    tweets.push(legacy);
                }
            }
        }
    });
    return tweets;
}

function pickLegacyByID(id, tweets_dict, users_dict) {
    function pickLegacyFromTweet(tweet) {
        tweet.user = users_dict[tweet.user_id_str];
        if (tweet.retweeted_status_id_str) {
            tweet.retweeted_status = pickLegacyFromTweet(tweets_dict[tweet.retweeted_status_id_str]);
        }
        return tweet;
    }

    if (tweets_dict[id]) {
        return pickLegacyFromTweet(tweets_dict[id]);
    }
}

function gatherLegacyFromLegacyApiData(data, filter = 'tweet-') {
    const tweets_dict = data.globalObjects.tweets;
    const users_dict = data.globalObjects.users;
    const tweets = [];
    data.timeline.instructions[0].addEntries.entries.forEach((entry) => {
        if (entry.entryId && entry.entryId.indexOf(filter) !== -1) {
            const tweet = pickLegacyByID(entry.content.item.content.tweet.id, tweets_dict, users_dict);
            if (tweet) {
                tweets.push(tweet);
            }
        }
    });
    return tweets;
}

const getUserTweetsByID = async (id, params = {}) => gatherLegacyFromData(await timelineTweets(id, params));
const getUserTweetsAndRepliesByID = async (id, params = {}) => gatherLegacyFromData(await timelineTweetsAndReplies(id, params));
const getUserMediaByID = async (id, params = {}) => gatherLegacyFromData(await timelineMedia(id, params));
const getUserLikesByID = async (id, params = {}) => gatherLegacyFromData(await timelineLikes(id, params));
const getUserTweetByStatus = async (id, params = {}) => gatherLegacyFromData(await tweetDetail(id, params), 'none');

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

const getUserTweets = (cache, id, params = {}) => cacheTryGet(cache, id, params, getUserTweetsByID);
const getUserTweetsAndReplies = (cache, id, params = {}) => cacheTryGet(cache, id, params, getUserTweetsAndRepliesByID);
const getUserMedia = (cache, id, params = {}) => cacheTryGet(cache, id, params, getUserMediaByID);
const getUserLikes = (cache, id, params = {}) => cacheTryGet(cache, id, params, getUserLikesByID);
const getUserTweet = (cache, id, params) => cacheTryGet(cache, id, params, getUserTweetByStatus);

const getSearch = async (keywords, params = {}) => gatherLegacyFromLegacyApiData(await timelineKeywords(keywords, params), 'sq-I-t-');

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
