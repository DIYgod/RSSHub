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
};
let cookieJar, setCookie, getCookies;

const cookiedomain = 'twitter.com';
const cookieurl = 'https://twitter.com';

async function init() {
    // 初始化
    cookieJar = new CookieJar();
    setCookie = promisify(cookieJar.setCookie.bind(cookieJar));
    getCookies = promisify(cookieJar.getCookies.bind(cookieJar));
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
    const cookies = response.headers['set-cookie'] instanceof Array ? response.headers['set-cookie'].map(Cookie.parse) : [Cookie.parse(response.headers['set-cookie'])];
    await Promise.all(cookies.map((c) => setCookie(c, cookieurl)));
}

async function twitter_got(endpoint, params, method = 'GET') {
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
    const cookies = response.headers['set-cookie'] ? (response.headers['set-cookie'] instanceof Array ? response.headers['set-cookie'].map(Cookie.parse) : [Cookie.parse(response.headers['set-cookie'])]) : [];
    await Promise.all(cookies.map((c) => setCookie(c, cookieurl)));
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
    const params = { variables: `{"screen_name":"${screen_name}","withHighlightedLabel":true}` };
    return (await twitter_got(endpoint, params)).data.user;
}

async function timeline_media(screen_name) {
    const user_id = (await user_by_screen_name(screen_name)).rest_id;
    const endpoint = `/2/timeline/media/${user_id}.json`;
    return await twitter_got(endpoint);
}

module.exports = { timeline_media };
