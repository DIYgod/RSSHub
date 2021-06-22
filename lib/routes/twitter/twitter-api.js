const got = require('@/utils/got');
const { CookieJar, Cookie } = require('tough-cookie');
const queryString = require('query-string');
const { promisify } = require('util');
const config = require('@/config').value;
const root = 'https://twitter.com/i/api';
const headers = {
    authorization: config.twitter.authorization,
    'x-guest-token': undefined,
    'x-twitter-auth-type': undefined,
    'x-twitter-client-language': 'en',
    'x-twitter-active-user': 'yes',
    'x-csrf-token': undefined,
    Referer: 'https://twitter.com/',
    'content-type': 'application/json',
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
};
const _params = {
    userId: undefined,
    count: 20,
    withHighlightedLabel: false,
    withTweetQuoteCount: false,
    includePromotedContent: false,
    withTweetResult: false,
    withReactions: false,
    withSuperFollowsTweetFields: false,
    withUserResults: false,
    withClientEventToken: false,
    withBirdwatchNotes: false,
    withBirdwatchPivots: false,
    withVoice: false,
    withNonLegacyCard: true,
};
let cookieJar, setCookies, getCookies;

const cookiedomain = 'twitter.com';
const cookieurl = 'https://twitter.com';

async function init() {
    // 初始化
    cookieJar = new CookieJar();
    getCookies = promisify(cookieJar.getCookies.bind(cookieJar));
    const setCookie = promisify(cookieJar.setCookie.bind(cookieJar));
    setCookies = async (headers) => {
        let cookies = [];
        if (headers['set-cookie']) {
            if (headers['set-cookie'] instanceof Array) {
                cookies = headers['set-cookie'].map(Cookie.parse);
            } else {
                cookies = [Cookie.parse(headers['set-cookie'])];
            }
        }
        await Promise.all(cookies.map((c) => setCookie(c, cookieurl)));
    };
    // 生成csrf-token
    const csrf_token = [...Array(16 * 2)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    await setCookie(new Cookie({ key: 'ct0', value: csrf_token, domain: cookiedomain, secure: false }), cookieurl);
    headers['x-csrf-token'] = csrf_token;
    // 发起初始化请求
    const response = await got({
        url: 'https://api.twitter.com/1.1/guest/activate.json',
        method: 'POST',
        headers: headers,
    });
    // 获取guest-token
    // TODO: OAuth2Session
    const guest_token = response.data.guest_token;
    await setCookie(new Cookie({ key: 'gt', value: guest_token, domain: cookiedomain, secure: false }), cookieurl);
    headers['x-guest-token'] = guest_token;
    // 获取cookies
    setCookies(response.headers);
}

async function call(endpoint, params, method = 'GET') {
    if (!cookieJar) {
        await init();
    }
    // 发起请求
    const response = await got({
        url: root + endpoint,
        method: method,
        headers: headers,
        searchParams: queryString.stringify(params),
        cookieJar,
    });
    // 更新cookies
    setCookies(response.headers);
    // 更新csrf_token
    for (const c of await getCookies(cookieurl)) {
        if (c.key === 'ct0') {
            headers['x-csrf-token'] = c.value;
        }
    }
    return response.data;
}

async function user_by_screen_name(screen_name) {
    const endpoint = '/graphql/hc-pka9A7gyS3xODIafnrQ/UserByScreenName';
    // 此处硬编码参考自https://github.com/mikf/gallery-dl/blob/master/gallery_dl/extractor/twitter.py#L698
    const params = { variables: `{"screen_name":"${screen_name}","withHighlightedLabel":true}` };
    return await call(endpoint, params);
}

async function pagination(endpoint, screen_name, params) {
    params = { ..._params, ...params };
    params.userId = (await user_by_screen_name(screen_name)).data.user.rest_id;
    return await call(endpoint, { variables: JSON.stringify(params) });
}

const timeline_tweets = (screen_name, params = {}) => pagination('/graphql/TcBvfe73eyQZSx3GW32RHQ/UserTweets', screen_name, params);
const timeline_tweets_and_replies = (screen_name, params = {}) => pagination('/graphql/kZ5WQPtzpRmUc-vIyDN_2g/UserTweetsAndReplies', screen_name, params);
const timeline_media = (screen_name, params = {}) => pagination('/graphql/GG2KjPMSkJiHJeOTk6RotA/UserMedia', screen_name, params);
// 此处硬编码抓取自浏览器请求

function pickLegacyFromTweet(tweet) {
    if (!(tweet.legacy && tweet.core)) {
        return undefined;
    }
    const legacy = tweet.legacy;
    legacy.user = tweet.core.user.legacy;
    if (legacy.retweeted_status) {
        legacy.retweeted_status = pickLegacyFromTweet(legacy.retweeted_status);
        if (!legacy.retweeted_status) {
            delete legacy.retweeted_status;
        }
    }
    return legacy;
}

function gatherLegacyFromEntries(entries) {
    const legacy = [];
    for (const entry of entries) {
        if (entry.entryId.indexOf('tweet') === -1) {
            continue;
        }
        const tweet = pickLegacyFromTweet(entry.content.itemContent.tweet);
        if (tweet) {
            legacy.push(tweet);
        }
    }
    return legacy;
}

const getLegacyTwit = (twit) => gatherLegacyFromEntries(twit.data.user.result.timeline.timeline.instructions[0].entries);
const getLegacyUser = (user) => user.data.user.legacy;

const getUser = async (screen_name) => getLegacyUser(await user_by_screen_name(screen_name));
const getUserTweets = async (screen_name, params = {}) => getLegacyTwit(await timeline_media(screen_name, params));
const getUserTweetsAndReplies = async (screen_name, params = {}) => getLegacyTwit(await timeline_tweets_and_replies(screen_name, params));
const getUserMedia = async (screen_name, params = {}) => getLegacyTwit(await timeline_tweets(screen_name, params));

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
