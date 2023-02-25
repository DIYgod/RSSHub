const got = require('@/utils/got');
const config = require('@/config').value;

const baseUrl = 'https://www.instagram.com';
const COOKIE_URL = 'https://instagram.com';
let igWwwClaim;

const getCSRFTokenFromJar = async (cookieJar) => {
    const cookieString = await cookieJar.getCookieString(COOKIE_URL);
    return cookieString.match(/csrftoken=([^;]+)/)?.[1];
};

const getHeaders = async (cookieJar) => ({
    'X-ASBD-ID': 198387,
    'X-CSRFToken': await getCSRFTokenFromJar(cookieJar),
    'X-IG-App-ID': 936619743392459,
    'X-IG-WWW-Claim': igWwwClaim,
});

const getUserInfo = async (username, cookieJar, cache) => {
    let webProfileInfo;
    let id = await cache.get(`instagram:getIdByUsername:${username}`);
    let userInfoCache = await cache.get(`instagram:userInfo:${id}`);

    if (!userInfoCache) {
        const response = await got(`${baseUrl}/api/v1/users/web_profile_info/`, {
            cookieJar,
            headers: await getHeaders(cookieJar),
            searchParams: {
                username,
            },
        });
        if (response.url.includes('/accounts/login/')) {
            throw Error('Invalid cookie');
        }
        igWwwClaim = response.headers['x-ig-set-www-claim'] || igWwwClaim;

        webProfileInfo = response.data.data.user;
        id = webProfileInfo.id;

        await cache.set(`instagram:getIdByUsername:${username}`, id, 31536000); // 1 year since it will never change
        await cache.set(`instagram:userInfo:${id}`, webProfileInfo);
    }

    userInfoCache = typeof userInfoCache === 'string' ? JSON.parse(userInfoCache) : userInfoCache;

    return userInfoCache || webProfileInfo;
};

const getUserFeedItems = (id, username, cookieJar, tryGet) =>
    tryGet(
        `instagram:feed:${id}`,
        async () => {
            const response = await got(`${baseUrl}/api/v1/feed/user/${username}/username/`, {
                cookieJar,
                headers: await getHeaders(cookieJar),
                searchParams: {
                    count: 30,
                },
            });
            // 401 Unauthorized if cookie does not match with IP
            igWwwClaim = response.headers['x-ig-set-www-claim'] || igWwwClaim;

            return response.data.items;
        },
        config.cache.routeExpire,
        false
    );

const getTagsFeedItems = (tag, tab, cookieJar, tryGet) =>
    tryGet(
        `instagram:tags:${tag}`,
        async () => {
            const response = await got(`${baseUrl}/api/v1/tags/web_info/`, {
                // cookieJar, cookieJar is behaving weirdly here, so we use cookie header instead
                headers: {
                    cookie: await cookieJar.getCookieString(COOKIE_URL),
                    ...(await getHeaders(cookieJar)),
                },
                searchParams: {
                    tag_name: tag,
                },
            });
            // Looks like cookie IP check is not applied to tags
            igWwwClaim = response.headers['x-ig-set-www-claim'] || igWwwClaim;

            return response.data.data[tab].sections.flatMap((section) => section.layout_content.medias.map((media) => media.media));
        },
        config.cache.routeExpire,
        false
    );

module.exports = {
    baseUrl,
    COOKIE_URL,
    getUserInfo,
    getUserFeedItems,
    getTagsFeedItems,
};
