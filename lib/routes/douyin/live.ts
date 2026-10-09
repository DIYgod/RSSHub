import { load } from 'cheerio';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import { queryToBoolean } from '@/utils/readable-social';

import { getOriginAvatar } from './utils';

interface DouyinImage {
    url_list: string[];
}

interface DouyinUser {
    nickname: string;
    sec_uid: string;
    avatar_thumb?: DouyinImage;
}

interface DouyinRoom {
    id_str: string;
    status: number;
    title: string;
    cover?: DouyinImage;
    owner?: DouyinUser;
}

interface RoomData {
    room: DouyinRoom;
    owner: DouyinUser;
}

interface StreamPayload {
    state?: {
        roomStore?: {
            roomInfo?: { room?: DouyinRoom; anchor?: DouyinUser };
        };
    };
}

interface EnterResponse {
    status_code: number;
    data?: { data?: DouyinRoom[]; user?: DouyinUser };
}

const firstSeenRequests = new Map<string, Promise<number>>();
const resourceTypes = new Set(['document', 'script', 'stylesheet', 'xhr', 'fetch']);

function getRoomData(room?: DouyinRoom, owner?: DouyinUser): RoomData | undefined {
    if (typeof room?.id_str === 'string' && /^\d+$/.test(room.id_str) && typeof room.status === 'number' && typeof room.title === 'string' && owner?.nickname) {
        return { room, owner };
    }
}

function parseRoomScript(script: string) {
    const match = script.match(/^\s*self\.__pace_f\.push\((\[.*\])\);?\s*$/s);
    if (!match) {
        return;
    }
    try {
        // Decode the streamed JSON data without executing the website's scripts.
        const chunk: unknown = JSON.parse(match[1]);
        if (!Array.isArray(chunk) || typeof chunk[1] !== 'string') {
            return;
        }
        const separator = chunk[1].indexOf(':');
        if (separator === -1) {
            return;
        }
        const value: unknown = JSON.parse(chunk[1].slice(separator + 1));
        if (!Array.isArray(value)) {
            return;
        }
        const payload = value[3] as StreamPayload | undefined;
        const info = payload?.state?.roomStore?.roomInfo;
        return getRoomData(info?.room, info?.anchor ?? info?.room?.owner);
    } catch {
        return;
    }
}

function parseRoomHtml(html: string) {
    const $ = load(html);
    return $('script')
        .toArray()
        .map((script) => parseRoomScript($(script).text()))
        .find((data) => data !== undefined);
}

async function getEnterResponse(page: Page) {
    try {
        const response = await page.waitForResponse(
            (response) => {
                const url = new URL(response.url());
                return url.hostname === 'live.douyin.com' && url.pathname.replace(/\/$/, '') === '/webcast/room/web/enter';
            },
            { timeout: config.requestTimeout }
        );
        return (await response.json()) as EnterResponse;
    } catch {
        logger.debug('Douyin live room API response was unavailable.');
    }
}

async function getBrowserRoomData(pageUrl: string) {
    const { page, destroy } = await getPlaywrightPage(pageUrl, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => (resourceTypes.has(route.request().resourceType()) ? route.continue() : route.abort()));
        const enterResponse = getEnterResponse(page);
        logger.http(`Requesting ${pageUrl}`);
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
        const streamedData = parseRoomHtml(await page.content());
        if (streamedData) {
            return streamedData;
        }
        const response = await enterResponse;
        if (response && response.status_code !== 0) {
            throw new Error(`Douyin live room API returned status code ${response.status_code}.`);
        }
        const room = response?.data?.data?.[0];
        const data = getRoomData(room, response?.data?.user ?? room?.owner);
        if (!data) {
            throw new Error('Douyin did not return live room data. Check that the room URL is accessible and Playwright is configured.');
        }
        return data;
    } finally {
        await destroy();
    }
}

async function getFirstSeen(roomId: string) {
    const existing = firstSeenRequests.get(roomId);
    if (existing) {
        return await existing;
    }
    const request = cache.tryGet(`douyin:live:first-seen:${roomId}`, () => Promise.resolve(Date.now()), 30 * 24 * 60 * 60, false);
    firstSeenRequests.set(roomId, request);
    try {
        return await request;
    } finally {
        firstSeenRequests.delete(roomId);
    }
}

const formatFirstSeen = (timestamp: number) => new Date(timestamp + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

export const route: Route = {
    path: '/live/:rid/:showTime?',
    categories: ['live'],
    example: '/douyin/live/685317364746',
    parameters: {
        rid: '直播间 id, 可在主播直播间页 URL 中找到',
        showTime: '是否在标题后添加本场首次检测时间，0/1/true/false，默认 false。',
    },
    description:
        '优先读取公开页面中的直播状态，必要时使用 Playwright 读取页面或直播间接口。showTime 开启时，标题后显示 RSSHub 本场首次检测时间（UTC+8），并非源站实际开播时刻，也不会作为 pubDate。时间按本场真实 room ID 缓存 30 天，重复读取不会延长有效期。内存缓存重启或清除缓存会重置记录，建议使用 Redis 保持记录稳定。',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['live.douyin.com/:rid'],
        },
    ],
    name: '直播间开播',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const rid = ctx.req.param('rid');
    if (!/^\d+$/.test(rid)) {
        throw new InvalidParameterError('Invalid room ID. Room ID should be a number.');
    }

    const pageUrl = `https://live.douyin.com/${rid}`;

    const { room: roomInfo, owner: roomOwner } = await cache.tryGet(
        `douyin:live:room:${rid}`,
        async () => {
            try {
                const html = await ofetch(pageUrl, { responseType: 'text', retry: 0, timeout: config.requestTimeout });
                const data = parseRoomHtml(html);
                if (data) {
                    return data;
                }
            } catch {
                logger.debug('Douyin public page did not provide live room data; trying Playwright.');
            }
            return await getBrowserRoomData(pageUrl);
        },
        config.cache.routeExpire,
        false
    );

    const nickname = roomOwner.nickname;
    const userAvatar = roomOwner.avatar_thumb?.url_list[0];
    const showTime = queryToBoolean(ctx.req.param('showTime')) ?? false;
    const firstSeen = await getFirstSeen(roomInfo.id_str);
    const suffix = showTime ? `（本场首次检测：${formatFirstSeen(firstSeen)} UTC+8）` : '';

    const items: DataItem[] = [];
    if (roomInfo.id_str) {
        if (roomInfo.status === 2) {
            items.push({
                title: `开播：${roomInfo.title}${suffix}`,
                description: roomInfo.cover?.url_list[0] ? `<img src="${roomInfo.cover.url_list[0]}">` : undefined,
                link: pageUrl,
                author: nickname,
                guid: roomInfo.id_str, // roomId is unique for each live event
            });
        } else if (roomInfo.status === 4) {
            items.push({
                title: `当前直播已结束，期待下一场：${roomInfo.title}${suffix}`,
                link: `https://www.douyin.com/user/${roomOwner.sec_uid}`,
                author: nickname,
                guid: roomInfo.id_str,
            });
        }
    }

    return {
        title: `${nickname}的抖音直播间 - 抖音直播`,
        description: `欢迎来到${nickname}的抖音直播间，${nickname}与大家一起记录美好生活 - 抖音直播`,
        image: userAvatar ? getOriginAvatar(userAvatar) : undefined,
        link: pageUrl,
        item: items,
        allowEmpty: true,
    };
}
