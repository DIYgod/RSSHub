import zlib from 'node:zlib';

import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import cache from './cache';

const processFloatTime = (time) => {
    const totalSeconds = Number.parseInt(time);
    const seconds = totalSeconds % 60;
    const minutes = ((totalSeconds - seconds) / 60) % 60;
    const hours = (totalSeconds - seconds - 60 * minutes) / 3600;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const route: Route = {
    path: '/video/danmaku/:bvid/:pid?',
    categories: ['social-media'],
    example: '/bilibili/video/danmaku/BV1vA411b7ip/1',
    parameters: { bvid: '视频AV号,可在视频页 URL 中找到', pid: '分P号,不填默认为1' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '视频弹幕',
    maintainers: ['Qixingchen'],
    handler,
};

async function handler(ctx) {
    let bvid = ctx.req.param('bvid');
    let aid;
    if (!bvid.startsWith('BV')) {
        aid = bvid;
        bvid = null;
    }
    const pid = Number(ctx.req.param('pid') || 1);
    const limit = 50;
    const cid = await cache.getCidFromId(aid, pid, bvid);

    const videoName = await cache.getVideoNameFromId(aid, bvid);

    const link = `https://www.bilibili.com/video/${bvid || `av${aid}`}`;
    const danmakuResponse = await got.get(`https://comment.bilibili.com/${cid}.xml`, {
        decompress: false,
        responseType: 'buffer',
        headers: {
            Referer: link,
        },
    });

    let danmakuText = danmakuResponse.body;

    danmakuText = await ((danmakuText[0] & 0x0f) === 0x08 ? zlib.inflateSync(danmakuText) : zlib.inflateRawSync(danmakuText));

    let danmakuList = [];
    const $ = load(danmakuText, { xmlMode: true });
    $('d').each((index, item) => {
        danmakuList.push({ p: $(item).attr('p'), text: $(item).text() });
    });

    danmakuList = danmakuList.toReversed().slice(0, limit);

    return {
        title: `${videoName} 的 弹幕动态`,
        link,
        description: `${videoName} 的 弹幕动态`,
        item: danmakuList.map((item) => ({
            title: `[${processFloatTime(item.p.split(',')[0])}] ${item.text}`,
            pubDate: new Date(item.p.split(',')[4] * 1000).toUTCString(),
            guid: `${cid}-${item.p.split(',')[4]}-${item.p.split(',')[7]}`,
            link,
        })),
    };
}
