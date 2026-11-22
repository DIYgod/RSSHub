import { load } from 'cheerio';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { queryToBoolean } from '@/utils/readable-social';
import { formatDate } from '@/utils/time';

import { getOriginAvatar } from './utils';

interface DouyinImage {
    url_list: string[];
}

interface DouyinUser {
    nickname: string;
    sec_uid: string;
    avatar_thumb: DouyinImage;
}

interface DouyinRoom {
    id_str: string;
    status: number;
    title: string;
    cover: DouyinImage;
}

interface StreamPayload {
    state?: {
        roomStore?: {
            roomInfo?: { room?: DouyinRoom; anchor: DouyinUser };
        };
    };
}

const firstSeenRequests = new Map<string, Promise<number>>();

function parseRoomScript(script: string) {
    const match = /^\s*self\.__pace_f\.push\((\[.*\])\);?\s*$/s.exec(script);
    if (!match) {
        return;
    }
    try {
        // Decode the streamed JSON data without executing the website's scripts.
        const chunk: [number, string] = JSON.parse(match[1]);
        const value: unknown[] = JSON.parse(chunk[1].slice(chunk[1].indexOf(':') + 1));
        const info = (value[3] as StreamPayload | undefined)?.state?.roomStore?.roomInfo;
        if (info?.room) {
            return { room: info.room, owner: info.anchor };
        }
    } catch {
        return;
    }
}

function parseRoomHtml(html: string) {
    const $ = load(html);
    for (const script of $('script:contains("roomStore")').toArray()) {
        const data = parseRoomScript($(script).text());
        if (data) {
            return data;
        }
    }
}

async function getFirstSeen(roomId: string) {
    const existing = firstSeenRequests.get(roomId);
    if (existing) {
        return await existing;
    }
    const request = cache.tryGet(`douyin:live:first-seen:${roomId}`, () => Promise.resolve(Temporal.Now.instant().epochMilliseconds), 30 * 24 * 60 * 60, false);
    firstSeenRequests.set(roomId, request);
    try {
        return await request;
    } finally {
        firstSeenRequests.delete(roomId);
    }
}

export const route: Route = {
    path: '/live/:rid/:showTime?',
    categories: ['live'],
    example: '/douyin/live/685317364746',
    parameters: {
        rid: '直播间 id, 可在主播直播间页 URL 中找到',
        showTime: '是否在标题后添加本场首次检测时间，0/1/true/false，默认 false。',
    },
    description:
        '读取公开页面中的直播状态。showTime 开启时，标题后显示 RSSHub 本场首次检测时间（UTC+8），并非源站实际开播时刻，也不会作为 pubDate。时间按本场真实 room ID 缓存 30 天，重复读取不会延长有效期。内存缓存重启或清除缓存会重置记录，建议使用 Redis 保持记录稳定。',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
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
    if (!/^[1-9]\d*$/.test(rid)) {
        throw new InvalidParameterError('Invalid room ID. Room ID should be a number.');
    }

    const pageUrl = `https://live.douyin.com/${rid}`;

    const { room: roomInfo, owner: roomOwner } = await cache.tryGet(
        `douyin:live:room:${rid}`,
        async () => {
            const html = await ofetch(pageUrl);
            const data = parseRoomHtml(html);
            if (!data) {
                throw new Error('Douyin did not return live room data. Check that the room ID is correct.');
            }
            return data;
        },
        config.cache.routeExpire,
        false
    );

    const nickname = roomOwner.nickname;
    const userAvatar = roomOwner.avatar_thumb.url_list[0];
    const showTime = queryToBoolean(ctx.req.param('showTime')) ?? false;
    const firstSeen = await getFirstSeen(roomInfo.id_str);
    const suffix = showTime ? `（本场首次检测：${formatDate(Temporal.Instant.fromEpochMilliseconds(firstSeen), 'YYYY-MM-DD HH:mm:ss', 8)} UTC+8）` : '';

    const items: DataItem[] = [];
    if (roomInfo.id_str) {
        if (roomInfo.status === 2) {
            items.push({
                title: `开播：${roomInfo.title}${suffix}`,
                description: `<img src="${roomInfo.cover.url_list[0]}">`,
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
        image: getOriginAvatar(userAvatar),
        link: pageUrl,
        item: items,
        allowEmpty: true,
    };
}
