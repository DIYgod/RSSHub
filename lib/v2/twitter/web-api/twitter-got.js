const { CookieJar, Cookie } = require('tough-cookie');
const { promisify } = require('util');
const queryString = require('query-string');
const got = require('@/utils/got');
const config = require('@/config').value;
const constants = require('./constants');

const authorization = config.twitter.authorization && config.twitter.authorization.length ? config.twitter.authorization : constants.auth;
const tokens = config.twitter.webApiTokens;

// https://github.com/mikf/gallery-dl/blob/a53cfc845e12d9e98fefd07e43ebffaec488c18f/gallery_dl/extractor/twitter.py#L716-L726
const headers = {
    authorization,
    'x-guest-token': undefined,
    'x-twitter-auth-type': undefined,
    'x-twitter-client-language': 'en',
    'x-twitter-active-user': 'yes',
    'x-csrf-token': undefined,
    Referer: 'https://twitter.com/',
};

let cookieJar,
    setCookie,
    getCookies,
    tries = 0;

const cookiedomain = 'twitter.com';
const cookieurl = 'https://twitter.com';

async function twitterGot(options) {
    // 更新csrfToken
    for (const c of await getCookies(cookieurl)) {
        if (c.key === 'ct0') {
            headers['x-csrf-token'] = c.value;
            break;
        }
    }
    return got({
        ...options,
        cookieJar,
        headers: { ...headers, ...(options.headers || {}) },
        https: { rejectUnauthorized: false },
    });
}

async function resetSession() {
    cookieJar = new CookieJar();
    getCookies = promisify(cookieJar.getCookies.bind(cookieJar));
    setCookie = promisify(cookieJar.setCookie.bind(cookieJar));

    headers.authorization = `Bearer ${authorization}`;
    await setCookie(
        new Cookie({
            key: 'auth_token',
            value: tokens[tries++ % tokens.length],
            domain: cookiedomain,
            secure: false,
        }),
        cookieurl
    );
    await twitterGot({
        url: 'https://twitter.com/i/api/fleets/v1/fleetline',
        method: 'GET',
        searchParams: queryString.stringify({ only_spaces: 'true' }),
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
        if (e.response.status === 403 || (e.response.status === 404 && !e.response.data) || (e.response.status === 429 && config.twitter.web_auth_token.length > 0)) {
            await resetSession();
            response = await request();
        } else {
            throw e;
        }
    }
    if (response.data.errors) {
        throw Error('API reports error:\n' + response.data.errors.map((e) => `${e.code}: ${e.message}`).join('\n'));
    }
    return response.data;
}

module.exports = twitterRequest;
