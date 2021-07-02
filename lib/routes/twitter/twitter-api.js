const twitterGot = require('./twitter-got');
const _params = {
    userId: undefined,
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

const call = (endpoint, params, method = 'GET', _root = 'https://api.twitter.com') => twitterGot(_root + endpoint, params, method);

const userByScreenName = (screenName) => call('/i/api/graphql/hc-pka9A7gyS3xODIafnrQ/UserByScreenName', { variables: `{"screen_name":"${screenName}","withHighlightedLabel":true}` }, 'GET', 'https://twitter.com');
const pagination = (endpoint, userId, params) => call(endpoint, { ..._params, ...params, userId: userId });
const timelineMedia = (userId, params = {}) => pagination(`/2/timeline/media/${userId}.json`, userId, params);
const timelineTweets = (userId, params = {}) => pagination(`/2/timeline/profile/${userId}.json`, userId, params);
const timelineTweetsAndReplies = (userId, params = {}) =>
    pagination(`/2/timeline/profile/${userId}.json`, userId, {
        ...params,
        include_tweet_replies: true,
    });

function pickLegacyFromEntry(entry, tweets_dict, users_dict) {
    if (!entry.entryId || entry.entryId.indexOf('tweet-') === -1) {
        return;
    }

    function pickLegacyFromTweet(tweet) {
        tweet.user = users_dict[tweet.user_id_str];
        if (tweet.retweeted_status_id_str) {
            tweet.retweeted_status = pickLegacyFromTweet(tweets_dict[tweet.retweeted_status_id_str], tweets_dict, users_dict);
        }
        return tweet;
    }

    return pickLegacyFromTweet(tweets_dict[entry.sortIndex]);
}

function gatherLegacyFromData(data) {
    const tweets_dict = data.globalObjects.tweets;
    const users_dict = data.globalObjects.users;
    const tweets = [];
    data.timeline.instructions[0].addEntries.entries.forEach((entry) => {
        const tweet = pickLegacyFromEntry(entry, tweets_dict, users_dict);
        if (tweet) {
            tweets.push(tweet);
        }
    });
    return tweets;
}

const getLegacyUser = (user) => user.data.user.legacy;

const getUser = async (screenName) => getLegacyUser(await userByScreenName(screenName));
const getUserTweets = async (screenName, params = {}) => gatherLegacyFromData(await timelineTweets((await userByScreenName(screenName)).data.user.rest_id, params));
const getUserTweetsAndReplies = async (screenName, params = {}) => gatherLegacyFromData(await timelineTweetsAndReplies((await userByScreenName(screenName)).data.user.rest_id, params));
const getUserMedia = async (screenName, params = {}) => gatherLegacyFromData(await timelineMedia((await userByScreenName(screenName)).data.user.rest_id, params));

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

module.exports = {
    getUser,
    getUserTweets,
    getUserTweetsAndReplies,
    getUserMedia,
    excludeRetweet,
};
