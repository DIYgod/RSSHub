const { CookieJar, Cookie } = require('tough-cookie');
const { promisify } = require('util');
const queryString = require('query-string');
const got = require('@/utils/got');
const config = require('@/config').value;
// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L716-L726
const headers = {
    authorization: config.twitter.authorization,
    // Bearer AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw
    // reference: https://github.com/dangeredwolf/FixTweet/blob/f3082bbb0d69798687481a605f6760b2eb7558e0/src/constants.ts#L23-L25
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

async function twitterGot(options) {
    const response = await got({
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
        cookieJar,
    });
    // 更新csrfToken
    for (const c of await getCookies(cookieurl)) {
        if (c.key === 'ct0') {
            headers['x-csrf-token'] = c.value;
        }
    }
    return response;
}

async function resetSession() {
    cookieJar = new CookieJar();
    getCookies = promisify(cookieJar.getCookies.bind(cookieJar));
    setCookie = promisify(cookieJar.setCookie.bind(cookieJar));
    // 生成csrf-token
    const csrfToken = [...Array(16 * 2)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    await setCookie(new Cookie({ key: 'ct0', value: csrfToken, domain: cookiedomain, secure: false }), cookieurl);
    headers['x-csrf-token'] = csrfToken;
    headers['x-guest-token'] = undefined;
    // 发起初始化请求
    const response = await twitterGot({
        url: 'https://api.twitter.com/1.1/guest/activate.json',
        method: 'POST',
    });
    // 获取guest-token
    // TODO: OAuth2Session, 参见 https://github.com/DIYgod/RSSHub/pull/7739#discussionR655932602
    const guestToken = response.data.guest_token;
    headers['x-guest-token'] = guestToken;
    await setCookie(new Cookie({ key: 'gt', value: guestToken, domain: cookiedomain, secure: false }), cookieurl);
    // 发起第二个初始化请求, 获取_twitter_sess
    await twitterGot({
        url: 'https://twitter.com/i/js_inst',
        method: 'GET',
        searchParams: queryString.stringify({ c_name: 'ui_metrics' }),
    });
    return cookieJar;
}

const initSession = () => cookieJar || resetSession();

async function twitterRequest(url, params, method) {
    await initSession();
    // 发起请求
    const request = () =>
        twitterGot({
            url,
            method,
            searchParams: queryString.stringify(params),
        });
    let response;
    try {
        response = await request();
    } catch (e) {
        if (e.response.status === 403) {
            await resetSession();
            response = await request();
        } else {
            throw e;
        }
    }
    return response.data;
}

module.exports = twitterRequest;
