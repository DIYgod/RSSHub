import { load } from 'cheerio';
import type { CookieJar } from 'tough-cookie';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import NotFoundError from '@/errors/types/not-found';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const baseUrl = 'https://www.instagram.com';

const docIds = {
    PolarisProfilePageContentQuery: '28036671149327607',
    PolarisProfilePostsQuery: '28570182382647478',
    PolarisProfileStoryHighlightsTrayContentQuery: '26970053832668570',
    PolarisStoriesV3ReelPageStandaloneQuery: '29184890191114309',
};

const getCSRFTokenFromJar = async (cookieJar: CookieJar) => {
    const cookieString = await cookieJar.getCookieString(baseUrl);
    return cookieString.match(/csrftoken=([^;]+)/)?.[1];
};

const getHeaders = async (cookieJar: CookieJar) => {
    const csrfToken = (await getCSRFTokenFromJar(cookieJar)) as string;
    return {
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-asbd-id': '359341',
        'x-csrftoken': csrfToken,
        'x-ig-app-id': '936619743392459',
        'x-ig-www-claim': '0',
    };
};

export const checkLogin = async (cookieJar: CookieJar) => {
    const response = await ofetch(`${baseUrl}/api/v1/web/fxcal/ig_sso_users/`, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            cookie: await cookieJar.getCookieString(baseUrl),
            ...(await getHeaders(cookieJar)),
        },
        method: 'POST',
    });

    return response.status === 'ok';
};

type User = {
    id: string;
    username: string;
    is_private: boolean;
    /**
     * absent for guests
     */
    friendship_status?: { following: boolean };
    full_name: string;
    biography?: string;
    profile_pic_url: string;
    hd_profile_pic_url_info?: { url: string };
};

const graphql = async (friendlyName: keyof typeof docIds, variables: object, tokens: { lsd: string; dtsg?: string }, cookieJar: CookieJar) => {
    const text = await ofetch(`${baseUrl}/graphql/query`, {
        method: 'POST',
        headers: {
            cookie: await cookieJar.getCookieString(baseUrl),
            ...(await getHeaders(cookieJar)),
            'x-fb-lsd': tokens.lsd,
        },
        body: new URLSearchParams({
            lsd: tokens.lsd,
            ...(tokens.dtsg && { fb_dtsg: tokens.dtsg }),
            fb_api_req_friendly_name: friendlyName,
            variables: JSON.stringify(variables),
            doc_id: docIds[friendlyName],
        }),
        responseType: 'text',
    });
    if (text.startsWith('<')) {
        throw new Error('Invalid cookie');
    }
    const response = JSON.parse(text.replace(/^for \(;;\);/, ''));
    if (!response.data) {
        throw new Error(`Instagram GraphQL ${friendlyName} failed: ${response.errors?.[0]?.message ?? text.slice(0, 200)}`);
    }
    return response.data;
};

const findKey = (obj: unknown, key: string): any => {
    if (!obj || typeof obj !== 'object') {
        return;
    }
    if (Object.hasOwn(obj, key)) {
        return obj[key];
    }
    for (const value of Object.values(obj)) {
        const found = findKey(value, key);
        if (found) {
            return found;
        }
    }
};

const getGuestUser = (html: string) => {
    const $ = load(html);
    return $('script[type="application/json"][data-sjs]')
        .toArray()
        .map((script) => findKey(JSON.parse($(script).text()), 'xig_user_by_username'))
        .find((user) => user?.full_name !== undefined);
};

export const getPage = async (username: string, cookieJar: CookieJar) => {
    const page = await ofetch.raw(`${baseUrl}/${username}/`, {
        headers: {
            cookie: await cookieJar.getCookieString(baseUrl),
        },
    });
    if (page.url.includes('/accounts/login/')) {
        throw new ConfigNotFoundError(page.url.includes('is_from_rle') ? 'Please set `INSTAGRAM_COOKIE`' : 'Invalid cookie');
    }

    await Promise.all(page.headers.getSetCookie().map((c) => cookieJar.setCookie(c, baseUrl)));

    const html = page._data as string;
    const profileId = html.match(/"profile_id":"(\d+)"/)?.[1];
    if (!profileId) {
        throw new NotFoundError(`Instagram user @${username} not found`);
    }
    return {
        html,
        tokens: {
            lsd: html.match(/"LSD",\[\],\{"token":"([^"]+)"/)?.[1] as string,
            dtsg: html.match(/"DTSGInitialData",\[\],\{"token":"([^"]+)"/)?.[1],
        },
        profileId,
    };
};

export const getUserInfo = (username: string, cookieJar: CookieJar, page: () => ReturnType<typeof getPage>): Promise<User> =>
    cache.tryGet(`instagram:userInfo:${username}`, async (): Promise<User> => {
        const { html, tokens, profileId } = await page();
        if (!tokens.dtsg) {
            return getGuestUser(html);
        }
        const profile = await graphql(
            'PolarisProfilePageContentQuery',
            {
                id: profileId,
                enable_integrity_filters: true,
                render_surface: 'PROFILE',
                __relay_internal__pv__PolarisCannesGuardianExperienceEnabledrelayprovider: false,
                __relay_internal__pv__PolarisCASB976ProfileEnabledrelayprovider: false,
                __relay_internal__pv__PolarisWebSchoolsEnabledrelayprovider: false,
                __relay_internal__pv__PolarisRepostsConsumptionEnabledrelayprovider: false,
                __relay_internal__pv__PolarisShortDramaEnabledrelayprovider: false,
            },
            tokens,
            cookieJar
        );
        return profile.user;
    });

export const getUserFeed = (username: string, cookieJar: CookieJar, page: () => ReturnType<typeof getPage>) =>
    cache.tryGet(
        `instagram:feed:${username}`,
        async () => {
            const { tokens } = await page();
            const posts = await graphql(
                'PolarisProfilePostsQuery',
                {
                    data: { count: 33, include_reel_media_seen_timestamp: true, include_relationship_info: true, latest_besties_reel_media: true, latest_reel_media: true },
                    username,
                    __relay_internal__pv__PolarisMultiCaptionCarouselEnabledrelayprovider: false,
                    __relay_internal__pv__PolarisReelsRecoDebugOverlayEnabledrelayprovider: false,
                    __relay_internal__pv__PolarisShortDramaEnabledrelayprovider: false,
                },
                tokens,
                cookieJar
            );
            return posts.xdt_api__v1__feed__user_timeline_graphql_connection.edges.map((edge) => edge.node);
        },
        config.cache.routeExpire,
        false
    );

export const getReelsMedia = (reelIds: string[], isHighlight: boolean, cookieJar: CookieJar, page: () => ReturnType<typeof getPage>) =>
    cache.tryGet(
        `instagram:reels:${reelIds.join(',')}`,
        async () => {
            const { tokens } = await page();
            const data = await graphql(
                'PolarisStoriesV3ReelPageStandaloneQuery',
                {
                    reel_ids_arr: reelIds,
                    is_highlight: isHighlight,
                    media_id: null,
                    __relay_internal__pv__PolarisCommunityNoteStoriesLabelEnabledrelayprovider: false,
                },
                tokens,
                cookieJar
            );

            return data.xdt_api__v1__feed__reels_media.reels_media.map((reel) => ({ ...reel, items: reel.items.map((item) => ({ ...item, user: reel.user })) }));
        },
        config.cache.routeExpire,
        false
    );

export const getHighlightIds = (userId: string, cookieJar: CookieJar, page: () => ReturnType<typeof getPage>): Promise<string[]> =>
    cache.tryGet(
        `instagram:highlights:${userId}`,
        async () => {
            const { tokens } = await page();
            const tray = await graphql('PolarisProfileStoryHighlightsTrayContentQuery', { user_id: userId, first: 12 }, tokens, cookieJar);
            return tray.highlights.edges.map((edge) => edge.node.id);
        },
        config.cache.routeExpire,
        false
    );

export const getTagsFeed = (tag, cookieJar: CookieJar) =>
    cache.tryGet(
        `instagram:tags:${tag}`,
        async () => {
            const response = await ofetch(`${baseUrl}/api/v1/tags/web_info/`, {
                // cookieJar, cookieJar is behaving weirdly here, so we use cookie header instead
                headers: {
                    cookie: await cookieJar.getCookieString(baseUrl),
                    ...(await getHeaders(cookieJar)),
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
