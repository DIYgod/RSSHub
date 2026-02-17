import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderImages } from '../templates/images';
import { renderVideo } from '../templates/video';

const baseUrl = 'https://www.instagram.com';
const COOKIE_URL = baseUrl;

const getCSRFTokenFromJar = async (cookieJar) => {
    const cookieString = await cookieJar.getCookieString(COOKIE_URL);
    return cookieString.match(/csrftoken=([^;]+)/)?.[1];
};

const getHeaders = async (cookieJar) => ({
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'x-asbd-id': 359341,
    'x-csrftoken': await getCSRFTokenFromJar(cookieJar),
    'x-ig-app-id': 936_619_743_392_459,
    'x-ig-www-claim': '0',
});

const checkLogin = async (cookieJar) => {
    const response = await ofetch(`${baseUrl}/api/v1/web/fxcal/ig_sso_users/`, {
        // cookieJar,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            cookie: (await cookieJar.getCookieString(COOKIE_URL)) as string,
            ...((await getHeaders(cookieJar)) as unknown as Record<string, string>),
            // 'X-IG-WWW-Claim': '0',
        },
        method: 'POST',
    });

    // const wwwClaimV2 = response.headers['x-ig-set-www-claim'];

    // if (wwwClaimV2) {
    //     cache.set('instagram:wwwClaimV2', wwwClaimV2);
    // }

    return Boolean(response.status === 'ok');
};

const getUserInfo = async (username, cookieJar) => {
    let webProfileInfo;
    let id = await cache.get(`instagram:getIdByUsername:${username}`);
    let userInfoCache = await cache.get(`instagram:userInfo:${id}`);
    userInfoCache = userInfoCache && typeof userInfoCache === 'string' ? JSON.parse(userInfoCache) : userInfoCache;

    if (!userInfoCache) {
        try {
            const response = await ofetch.raw(`${baseUrl}/api/v1/users/web_profile_info/`, {
                // cookieJar,
                headers: {
                    cookie: (await cookieJar.getCookieString(COOKIE_URL)) as string,
                    ...((await getHeaders(cookieJar)) as unknown as Record<string, string>),
                    // 'X-IG-WWW-Claim': (await cache.get('instagram:wwwClaimV2')) ?? undefined,
                },
                query: {
                    username,
                },
            });
            if (response.url.includes('/accounts/login/')) {
                throw new ConfigNotFoundError('Invalid cookie');
            }

            webProfileInfo = response._data.data.user;
            id = webProfileInfo.id;

            await cache.set(`instagram:getIdByUsername:${username}`, id, 31_536_000); // 1 year since it will never change
            await cache.set(`instagram:userInfo:${id}`, webProfileInfo);
        } catch (error) {
            if (error.message.includes("Cookie not in this host's domain")) {
                throw new ConfigNotFoundError('Invalid cookie');
            }
            throw error;
        }
    }

    return userInfoCache || webProfileInfo;
};

const getUserFeedItems = (id, username, cookieJar) =>
    cache.tryGet(
        `instagram:feed:${id}`,
        async () => {
            const response = await ofetch.raw(`${baseUrl}/api/v1/feed/user/${username}/username/`, {
                // cookieJar,
                headers: {
                    cookie: (await cookieJar.getCookieString(COOKIE_URL)) as string,
                    ...((await getHeaders(cookieJar)) as unknown as Record<string, string>),
                    // 401 Unauthorized if cookie does not match with IP
                    // 'X-IG-WWW-Claim': await cache.get('instagram:wwwClaimV2'),
                },
                query: {
                    count: 30,
                },
            });
            if (response.url.includes('/accounts/login/')) {
                throw new ConfigNotFoundError(`Invalid cookie.
                Please also check if your account is being blocked by Instagram.`);
            }

            return response._data.items;
        },
        config.cache.routeExpire,
        false
    );

const getTagsFeed = (tag, cookieJar) =>
    cache.tryGet(
        `instagram:tags:${tag}`,
        async () => {
            const response = await ofetch(`${baseUrl}/api/v1/tags/web_info/`, {
                // cookieJar, cookieJar is behaving weirdly here, so we use cookie header instead
                headers: {
                    cookie: (await cookieJar.getCookieString(COOKIE_URL)) as string,
                    ...((await getHeaders(cookieJar)) as unknown as Record<string, string>),
                },
                query: {
                    tag_name: tag,
                },
            });

            return response.data;
        },
        config.cache.routeExpire,
        false
    );

const renderGuestItems = (items) => {
    const renderVideoItem = (node, summary) =>
        renderVideo({
            summary,
            image: node.display_url,
            video: {
                url: node.video_url,
                height: node.dimensions.height,
                width: node.dimensions.width,
            },
        });
    const renderImagesItem = (node, summary) =>
        renderImages({
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
                                      return renderVideoItem(node, i === 0 ? summary : '');
                                  case 'GraphImage':
                                      return renderImagesItem(node, i === 0 ? summary : '');
                                  default:
                                      throw new Error(`Instagram: Unhandled carousel type: ${_type}`);
                              }
                          })
                          .join('')
                    : renderImages(node, summary);
                break;
            case 'GraphVideo':
                description = renderVideoItem(node, summary);
                break;
            case 'GraphImage':
                description = renderImagesItem(node, summary);
                break;
            default:
                throw new Error(`Instagram: Unhandled feed type: ${type}`);
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

export { baseUrl, checkLogin, COOKIE_URL, getTagsFeed, getUserFeedItems, getUserInfo, renderGuestItems };
