const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://www.instagram.com';
const COOKIE_URL = 'https://instagram.com';

const getCSRFTokenFromJar = async (cookieJar) => {
    const cookieString = await cookieJar.getCookieString(COOKIE_URL);
    return cookieString.match(/csrftoken=([^;]+)/)?.[1];
};

const getHeaders = async (cookieJar) => ({
    'X-ASBD-ID': 198387,
    'X-CSRFToken': await getCSRFTokenFromJar(cookieJar),
    'X-IG-App-ID': 936619743392459,
    'X-IG-WWW-Claim': undefined,
});

const checkLogin = async (cookieJar, cache) => {
    const response = await got.post(`${baseUrl}/api/v1/web/fxcal/ig_sso_users/`, {
        // cookieJar,
        headers: {
            cookie: await cookieJar.getCookieString(COOKIE_URL),
            ...(await getHeaders(cookieJar)),
            'X-IG-WWW-Claim': '0',
        },
    });

    const wwwClaimV2 = response.headers['x-ig-set-www-claim'];

    if (wwwClaimV2) {
        cache.set('instagram:wwwClaimV2', wwwClaimV2);
    }

    return Boolean(response.data.status === 'ok');
};

const getUserInfo = async (username, cookieJar, cache) => {
    let webProfileInfo;
    let id = await cache.get(`instagram:getIdByUsername:${username}`);
    let userInfoCache = await cache.get(`instagram:userInfo:${id}`);

    if (!userInfoCache) {
        try {
            const response = await got(`${baseUrl}/api/v1/users/web_profile_info/`, {
                cookieJar,
                headers: {
                    ...(await getHeaders(cookieJar)),
                    'X-IG-WWW-Claim': await cache.get('instagram:wwwClaimV2'),
                },
                searchParams: {
                    username,
                },
            });
            if (response.url.includes('/accounts/login/')) {
                throw Error('Invalid cookie');
            }

            webProfileInfo = response.data.data.user;
            id = webProfileInfo.id;

            await cache.set(`instagram:getIdByUsername:${username}`, id, 31536000); // 1 year since it will never change
            await cache.set(`instagram:userInfo:${id}`, webProfileInfo);
        } catch (e) {
            if (e.message.includes("Cookie not in this host's domain")) {
                throw Error('Invalid cookie');
            }
            throw e;
        }
    }

    userInfoCache = typeof userInfoCache === 'string' ? JSON.parse(userInfoCache) : userInfoCache;

    return userInfoCache || webProfileInfo;
};

const getUserFeedItems = (id, username, cookieJar, cache) =>
    cache.tryGet(
        `instagram:feed:${id}`,
        async () => {
            const response = await got(`${baseUrl}/api/v1/feed/user/${username}/username/`, {
                // cookieJar,
                headers: {
                    cookie: await cookieJar.getCookieString(COOKIE_URL),
                    ...(await getHeaders(cookieJar)),
                    // 401 Unauthorized if cookie does not match with IP
                    'X-IG-WWW-Claim': await cache.get('instagram:wwwClaimV2'),
                },
                searchParams: {
                    count: 30,
                },
            });
            if (response.url.includes('/accounts/login/')) {
                throw Error(`Invalid cookie.
                Please also check if your account is being blocked by Instagram.`);
            }

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

            return response.data.data[tab].sections.flatMap((section) => section.layout_content.medias.map((media) => media.media));
        },
        config.cache.routeExpire,
        false
    );

const getLoggedOutTagsFeedItems = async (tag, cookieJar) => {
    const response = await got(`${baseUrl}/api/v1/tags/logged_out_web_info/`, {
        // cookieJar, cookieJar is behaving weirdly here, so we use cookie header instead
        headers: {
            cookie: await cookieJar.getCookieString(COOKIE_URL),
            ...(await getHeaders(cookieJar)),
            'X-IG-WWW-Claim': '0',
        },
        searchParams: {
            tag_name: tag,
        },
    });

    const cookies = response.headers['set-cookie'];
    if (cookies) {
        for await (const cookie of cookies) {
            await cookieJar.setCookie(cookie, COOKIE_URL);
        }
    }

    return response.data.data.hashtag;
};

const renderGuestItems = (items) => {
    const renderVideo = (node, summary) =>
        art(path.join(__dirname, '../templates/video.art'), {
            summary,
            image: node.display_url,
            video: {
                url: node.video_url,
                height: node.dimensions.height,
                width: node.dimensions.width,
            },
        });
    const renderImages = (node, summary) =>
        art(path.join(__dirname, '../templates/images.art'), {
            summary,
            images: [{ url: node.display_url, height: node.dimensions.height, width: node.dimensions.width }],
        });

    return items.map(({ node }) => {
        const type = node.__typename;
        const summary = node.edge_media_to_caption.edges[0]?.node.text ?? '';

        let description = '';
        switch (type) {
            // carousel, can include GraphVideo and GraphImage
            case 'GraphSidecar':
                description = node.edge_sidecar_to_children
                    ? node.edge_sidecar_to_children.edges
                          .map(({ node }, i) => {
                              const _type = node.__typename;
                              switch (_type) {
                                  case 'GraphVideo':
                                      return renderVideo(node, i === 0 ? summary : '');
                                  case 'GraphImage':
                                      return renderImages(node, i === 0 ? summary : '');
                                  default:
                                      throw Error(`Instagram: Unhandled carousel type: ${_type}`);
                              }
                          })
                          .join('')
                    : renderImages(node, summary);
                break;
            case 'GraphVideo':
                description = renderVideo(node, summary);
                break;
            case 'GraphImage':
                description = renderImages(node, summary);
                break;
            default:
                throw Error(`Instagram: Unhandled feed type: ${type}`);
        }

        return {
            title: summary.split('\n')[0],
            id: node.id,
            pubDate: parseDate(node.taken_at_timestamp, 'X'),
            author: node.owner.username,
            link: `${baseUrl}/p/${node.shortcode}/`,
            summary,
            description,
        };
    });
};

module.exports = {
    baseUrl,
    COOKIE_URL,
    checkLogin,
    getUserInfo,
    getUserFeedItems,
    getTagsFeedItems,
    getLoggedOutTagsFeedItems,
    renderGuestItems,
};
