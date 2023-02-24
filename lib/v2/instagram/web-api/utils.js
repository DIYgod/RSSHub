const got = require('@/utils/got');
const config = require('@/config').value;

const baseUrl = 'https://www.instagram.com';
let igWwwClaim;

const getCSRFTokenFromJar = async (cookieJar) => {
    const cookieString = await cookieJar.getCookieString('https://instagram.com');
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
        igWwwClaim = response.headers['x-ig-set-www-claim'] || igWwwClaim;

        webProfileInfo = response.data.data.user;
        id = webProfileInfo.id;

        await cache.set(`instagram:getIdByUsername:${username}`, id, 31536000);
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
            igWwwClaim = response.headers['x-ig-set-www-claim'] || igWwwClaim;

            return response.data.items;
        },
        config.cache.routeExpire,
        false
    );

const getTagsFeedItems = (tag, tab, cookie, cookieJar, tryGet) =>
    tryGet(
        `instagram:tags:${tag}`,
        async () => {
            const response = await got(`${baseUrl}/api/v1/tags/web_info/`, {
                headers: {
                    cookie,
                    ...(await getHeaders(cookieJar)),
                },
                searchParams: {
                    tag_name: tag,
                },
            });
            igWwwClaim = response.headers['x-ig-set-www-claim'] || igWwwClaim;

            return response.data.data[tab].sections.flatMap((section) => section.layout_content.medias.map((media) => media.media));
        },
        config.cache.routeExpire,
        false
    );

module.exports = {
    getUserInfo,
    getUserFeedItems,
    getTagsFeedItems,
};
