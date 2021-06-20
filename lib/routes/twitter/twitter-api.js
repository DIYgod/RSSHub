const got = require('@/utils/got');
const { CookieJar, Cookie } = require('tough-cookie');
const queryString = require('query-string');
const { promisify } = require('util');
const root = 'https://twitter.com/i/api';
const headers = {
    authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
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
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36 Edg/91.0.864.48',
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

async function user_id_by_screen_name(screen_name) {
    const endpoint = '/graphql/hc-pka9A7gyS3xODIafnrQ/UserByScreenName';
    const params = { variables: `{"screen_name":"${screen_name}","withHighlightedLabel":true}` };
    return (await call(endpoint, params)).data.user.rest_id;
}

async function pagination(endpoint, screen_name, params) {
    params = { ..._params, ...params };
    params.userId = await user_id_by_screen_name(screen_name);
    return await call(endpoint, { variables: JSON.stringify(params) });
}

const timeline_profile = (screen_name, params = {}) => pagination('/graphql/TcBvfe73eyQZSx3GW32RHQ/UserTweets', screen_name, params);
const timeline_media = (screen_name, params = {}) => pagination('/graphql/GG2KjPMSkJiHJeOTk6RotA/UserMedia', screen_name, params);
const timeline_favorites = (screen_name, params = {}) => pagination('/graphql/eSI00iKA-FNj9xvYMt74Mg/Likes', screen_name, params);

async function search(query) {
    const endpoint = '/2/search/adaptive.json';
    const params = { ..._params };
    params.q = query;
    params.tweet_search_mode = 'live';
    params.query_source = 'typed_query';
    params.pc = '1';
    params.spelling_corrections = '1';
    return await pagination(endpoint, params);
}

module.exports = { timeline_profile, timeline_media, timeline_favorites, search };
