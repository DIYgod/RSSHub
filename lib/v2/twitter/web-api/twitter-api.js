const twitterGot = require('./twitter-got');
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
    paginationTweets('/graphql/WZT7sCTrLvSOaWOXLDsWbQ/UserTweets', userId, {
        ...params,
        withQuickPromoteEligibilityTweetFields: true,
    });

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L816-L823
const timelineTweetsAndReplies = (userId, params = {}) =>
    paginationTweets('/graphql/t4wEKVulW4Mbv1P0kgxTEw/UserTweetsAndReplies', userId, {
        ...params,
        withCommunity: true,
    });

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L825-L831
const timelineMedia = (userId, params = {}) => paginationTweets('/graphql/nRybED9kRbN-TOWioHq1ng/UserMedia', userId, params);

// this query requires login
// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L833-L839
const timelineLikes = (userId, params = {}) => paginationTweets(`/graphql/9MSTt44HoGjVFSg_u3rHDw/Likes`, userId, params);

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

function gatherLegacyFromData(entries, filter = 'tweet-') {
    const tweets = [];
    entries.forEach((entry) => {
        if (entry.entryId && entry.entryId.includes(filter)) {
            const tweet = entry.content.itemContent.tweet_results?.result;
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
    twitterGot('https://twitter.com/i/api/graphql/hc-pka9A7gyS3xODIafnrQ/UserByScreenName', {
        variables: `{"screen_name":"${screenName}","withHighlightedLabel":true}`,
    });
const getUserData = (cache, screenName) => cache.tryGet(`twitter-userdata-${screenName}`, () => userByScreenName(screenName));
const getUserID = async (cache, screenName) => (await getUserData(cache, screenName)).data.user.rest_id;
const getUser = async (cache, screenName) => (await getUserData(cache, screenName)).data.user.legacy;

const cacheTryGet = async (cache, screenName, params, func) => {
    const id = await getUserID(cache, screenName);
    const funcName = func.name;
    const paramsString = JSON.stringify(params);
    return cache.tryGet(`twitter:${id}:${funcName}:${paramsString}`, () => func(id, params), config.cache.routeExpire, false);
};

const getUserTweets = (cache, screenName, params = {}) => cacheTryGet(cache, screenName, params, getUserTweetsByID);
const getUserTweetsAndReplies = (cache, screenName, params = {}) => cacheTryGet(cache, screenName, params, getUserTweetsAndRepliesByID);
const getUserMedia = (cache, screenName, params = {}) => cacheTryGet(cache, screenName, params, getUserMediaByID);
const getUserLikes = (cache, screenName, params = {}) => cacheTryGet(cache, screenName, params, getUserLikesByID);

const getSearch = async (keywords, params = {}) => gatherLegacyFromLegacyApiData(await timelineKeywords(keywords, params), 'sq-I-t-');

module.exports = {
    getUser,
    getUserTweets,
    getUserTweetsAndReplies,
    getUserMedia,
    getUserLikes,
    excludeRetweet,
    getSearch,
};
