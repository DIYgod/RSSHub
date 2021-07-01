const queryString = require('query-string');
const { resetSession, twitterGot, cookieJar } = require('./twitter-got');
const root = 'https://api.twitter.com';
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
    cursor: 'None',
    ext: 'mediaStats,highlightedLabel',
};

const init = resetSession;

async function request(url, params, method) {
    if (!cookieJar()) {
        await init();
    }
    // 发起请求
    const request = () =>
        twitterGot({
            url: url,
            method: method,
            searchParams: queryString.stringify(params),
        });
    let response;
    try {
        response = await request();
    } catch (e) {
        if (e.response.status === 403) {
            await init();
            response = await request();
        } else {
            throw e;
        }
    }
    return response.data;
}

async function call(endpoint, params, method = 'GET', _root = root) {
    return request(_root + endpoint, params, method);
}

const userByScreenName = (screenName) => call('/i/api/graphql/hc-pka9A7gyS3xODIafnrQ/UserByScreenName', { variables: `{"screen_name":"${screenName}","withHighlightedLabel":true}` }, 'GET', 'https://twitter.com');
const pagination = (endpoint, userId, params) => call(endpoint, { ..._params, ...params, userId: userId });
const timelineMedia = (userId, params = {}) => pagination(`/2/timeline/media/${userId}.json`, userId, params);
const timelineTweets = (userId, params = {}) => pagination(`/2/timeline/profile/${userId}.json`, userId, params);
const timelineTweetsAndReplies = (userId, params = {}) =>
    pagination(`/2/timeline/profile/${userId}.json`, userId, {
        ...params,
        include_tweet_replies: true,
    });

function pickLegacyFromTweet(tweet, tweets_dict, users_dict) {
    tweet.user = users_dict[tweet.user_id_str];
    if (tweet.retweeted_status_id_str) {
        tweet.retweeted_status = pickLegacyFromTweet(tweets_dict[tweet.retweeted_status_id_str], tweets_dict, users_dict);
    }
    return tweet;
}

function gatherLegacyFromData(data) {
    const tweets_dict = data.globalObjects.tweets;
    const users_dict = data.globalObjects.users;
    return data.timeline.instructions[0].addEntries.entries.map((tweet) => pickLegacyFromTweet(tweet, tweets_dict, users_dict));
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
