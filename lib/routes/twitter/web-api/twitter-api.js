const twitterGot = require('./twitter-got');
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
    send_error_codes: true,
    simple_quoted_tweet: true,
    include_tweet_replies: false,
    ext: 'mediaStats,highlightedLabel',
};

const pagination = (endpoint, userId, params) =>
    twitterGot('https://api.twitter.com' + endpoint, {
        ..._params,
        ...params,
        userId,
    });
const timelineMedia = (userId, params = {}) => pagination(`/2/timeline/media/${userId}.json`, userId, params);
const timelineTweets = (userId, params = {}) => pagination(`/2/timeline/profile/${userId}.json`, userId, params);
const timelineTweetsAndReplies = (userId, params = {}) =>
    pagination(`/2/timeline/profile/${userId}.json`, userId, {
        ...params,
        include_tweet_replies: true,
    });
const timelineLikes = (userId, params = {}) =>
    pagination(`/2/timeline/favorites/${userId}.json`, userId, {
        ...params,
        sorted_by_time: true,
    });
const timelineKeywords = (keywords, params = {}) =>
    twitterGot('https://twitter.com/i/api/2/search/adaptive.json', {
        ..._params,
        ...params,
        q: keywords,
        query_source: 'typed_query',
        pc: 1,
    });

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

function gatherLegacyFromData(data, filter = 'tweet-') {
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

const getUserTweets = async (cache, screenName, params = {}) => getUserTweetsByID(await getUserID(cache, screenName), params);
const getUserTweetsAndReplies = async (cache, screenName, params = {}) => getUserTweetsAndRepliesByID(await getUserID(cache, screenName), params);
const getUserMedia = async (cache, screenName, params = {}) => getUserMediaByID(await getUserID(cache, screenName), params);
const getUserLikes = async (cache, screenName, params = {}) => getUserLikesByID(await getUserID(cache, screenName), params);
const getSearch = async (keywords, params = {}) => gatherLegacyFromData(await timelineKeywords(keywords, params), 'sq-I-t-');

module.exports = {
    getUser,
    getUserTweets,
    getUserTweetsAndReplies,
    getUserMedia,
    getUserLikes,
    excludeRetweet,
    getSearch,
};
