import type { Context } from 'hono';

import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDuration } from '@/utils/helpers';
import logger from '@/utils/logger';
import { getPlaywrightPage, type Page } from '@/utils/playwright';

import cache from './cache';
import utils, { getVideoUrl } from './utils';

export const route: Route = {
    path: '/user/video/:uid/:embed?',
    categories: ['social-media'],
    view: ViewType.Videos,
    example: '/bilibili/user/video/2267573',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', embed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['space.bilibili.com/:uid'],
            target: '/user/video/:uid',
        },
    ],
    name: 'UP 主投稿',
    maintainers: ['DIYgod', 'Konano', 'pseudoyu'],
    handler,
};

interface VideoItem {
    aid: number;
    author?: string;
    bvid?: string;
    comment?: number;
    created: number;
    description: string;
    length: string;
    pic: string;
    title: string;
}

interface VideoListData {
    list?: {
        vlist?: VideoItem[];
    };
}

interface VideoListResponse {
    code?: number;
    data?: VideoListData;
    message?: string;
}

type BrowserResponse = Awaited<ReturnType<Page['waitForResponse']>>;

const videoListApiPath = '/x/space/wbi/arc/search';
const allowedBrowserRequestTypes = new Set(['document', 'script', 'xhr', 'fetch', 'image', 'font', 'stylesheet', 'other']);
const browserResponseTimeout = 45000;
const browserCloseTimeout = 90000;

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

const isVideoListApiJsonResponse = (response: BrowserResponse) => {
    const request = response.request();
    const contentType = response.headers()['content-type'];
    return response.url().includes(videoListApiPath) && request.method() === 'GET' && (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') && contentType?.includes('application/json');
};

const waitForVideoListResponse = async (page: Page) => {
    try {
        return {
            response: await page.waitForResponse(isVideoListApiJsonResponse, { timeout: browserResponseTimeout }),
        };
    } catch (error) {
        return { error };
    }
};

const navigateToVideoPage = async (page: Page, videoUrl: string) => {
    try {
        await page.goto(videoUrl, { timeout: browserResponseTimeout, waitUntil: 'domcontentloaded' });
    } catch (error) {
        logger.warn(`[bilibili/video] video page navigation did not finish before the response wait ended: ${getErrorMessage(error)}`);
    }
};

async function applyCookie(page: Page, cookie: string) {
    const cookies = cookie
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
            const equalIndex = item.indexOf('=');
            if (equalIndex <= 0) {
                return;
            }

            return {
                name: item.slice(0, equalIndex).trim(),
                value: item.slice(equalIndex + 1).trim(),
                domain: '.bilibili.com',
                path: '/',
            };
        })
        .filter((item) => item !== undefined);

    if (cookies.length > 0) {
        await page.setCookie(...cookies);
    }
}

async function fetchVideoListFromApi(uid: string): Promise<VideoListData> {
    const cookie = await cache.getCookie();
    const wbiVerifyString = await cache.getWbiVerifyString();
    const dmImgList = utils.getDmImgList();
    const dmImgInter = utils.getDmImgInter();
    const renderData = await cache.getRenderData(uid);

    const params = utils.addWbiVerifyInfo(
        utils.addRenderData(utils.addDmVerifyInfoWithInter(`mid=${uid}&ps=30&tid=0&pn=1&keyword=&order=pubdate&platform=web&web_location=1550101&order_avoided=true`, dmImgList, dmImgInter), renderData),
        wbiVerifyString
    );
    const response = await got(`https://api.bilibili.com${videoListApiPath}?${params}`, {
        headers: {
            Referer: `https://space.bilibili.com/${uid}`,
            origin: 'https://space.bilibili.com',
            Cookie: cookie,
        },
    });
    const data = response.data;
    if (data.code) {
        logger.error(JSON.stringify(data.data));
        throw new Error(`Got error code ${data.code} while fetching: ${data.message}`);
    }

    return data.data;
}

async function fetchVideoListFromBrowser(uid: string): Promise<VideoListData> {
    const cookie = cache.getConfiguredCookie();
    const userUrl = `https://space.bilibili.com/${uid}`;
    const videoUrl = `${userUrl}/video`;
    logger.info(`[bilibili/video] fetching via playwright: ${videoUrl}`);

    const { destroy, page } = await getPlaywrightPage(userUrl, {
        closeTimeout: browserCloseTimeout,
        noGoto: true,
        onBeforeLoad: async (page) => {
            if (cookie) {
                await applyCookie(page, cookie);
            }

            await page.setRequestInterception(true);
            page.on('request', (request) => {
                allowedBrowserRequestTypes.has(request.resourceType()) ? request.continue() : request.abort();
            });
        },
        gotoConfig: { waitUntil: 'domcontentloaded' },
    });

    try {
        const videoListResponsePromise = waitForVideoListResponse(page);
        await page.goto(userUrl, { waitUntil: 'domcontentloaded' });
        void navigateToVideoPage(page, videoUrl);

        const videoListResponseResult = await videoListResponsePromise;
        if ('error' in videoListResponseResult) {
            throw new Error(`Bilibili browser mode did not receive a JSON video list response within ${browserResponseTimeout}ms: ${getErrorMessage(videoListResponseResult.error)}`);
        }

        const response = videoListResponseResult.response;
        const data = (await response.json()) as VideoListResponse;
        if (data.code) {
            logger.error(JSON.stringify(data.data));
            throw new Error(`Got error code ${data.code} while fetching in browser mode: ${data.message}`);
        }

        if (!data.data) {
            throw new Error('Bilibili browser response does not contain video list data');
        }

        return data.data;
    } finally {
        await destroy();
    }
}

async function getVideoList(uid: string): Promise<VideoListData> {
    try {
        return await fetchVideoListFromApi(uid);
    } catch (error) {
        logger.warn(`[bilibili/video] API request failed, falling back to browser mode: ${error}`);
        return fetchVideoListFromBrowser(uid);
    }
}

async function handler(ctx: Context) {
    const isJsonFeed = ctx.req.query('format') === 'json';

    const uid = ctx.req.param('uid');
    const embed = !ctx.req.param('embed');
    const data = await getVideoList(uid);
    const videos = data.list?.vlist ?? [];

    let name = videos[0]?.author || uid;
    let face: string | undefined;

    try {
        const usernameAndFace = await cache.getUsernameAndFaceFromUID(uid);
        name = usernameAndFace[0] || name;
        face = usernameAndFace[1];
    } catch (error) {
        logger.warn(`[bilibili/video] failed to fetch user profile: ${error}`);
    }

    return {
        title: `${name} 的 bilibili 空间`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 空间`,
        image: face ?? undefined,
        logo: face ?? undefined,
        icon: face ?? undefined,
        item: await Promise.all(
            videos.map(async (item) => {
                const subtitles = isJsonFeed && !config.bilibili.excludeSubtitles && item.bvid ? await cache.getVideoSubtitleAttachment(item.bvid) : [];
                return {
                    title: item.title,
                    description: utils.renderUGCDescription(embed, item.pic, item.description, item.aid, undefined, item.bvid),
                    pubDate: new Date(item.created * 1000).toUTCString(),
                    link: item.created > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                    author: name,
                    comments: item.comment,
                    attachments: item.bvid
                        ? [
                              {
                                  url: getVideoUrl(item.bvid),
                                  mime_type: 'text/html',
                                  duration_in_seconds: parseDuration(item.length),
                              },
                              ...subtitles,
                          ]
                        : undefined,
                };
            })
        ),
    };
}
