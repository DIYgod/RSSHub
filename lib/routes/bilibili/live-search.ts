import type { Route } from '@/types';
import got from '@/utils/got';

import cache from './cache';
import utils from './utils';

export const route: Route = {
    path: '/live/search/:key/:order',
    categories: ['live'],
    example: '/bilibili/live/search/dota/online',
    parameters: { key: '搜索关键字', order: '排序方式, live_time 开播时间, online 人气' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '直播搜索',
    maintainers: ['Qixingchen'],
    handler,
};

async function handler(ctx) {
    const key = ctx.req.param('key');
    const order = ctx.req.param('order');

    const urlEncodedKey = encodeURIComponent(key);
    let orderTitle: string;

    switch (order) {
        case 'live_time':
            orderTitle = '最新开播';
            break;
        case 'online':
            orderTitle = '人气直播';
            break;
        default:
            throw new Error(`Unknown order: ${order}`);
    }
    const wbiVerifyString = await cache.getWbiVerifyString();
    let params = `__refresh__=true&_extra=&context=&page=1&page_size=42&order=${order}&duration=&from_source=&from_spmid=333.337&platform=pc&highlight=1&single_column=0&keyword=${urlEncodedKey}&ad_resource=&source_tag=3&gaia_vtoken=&category_id=&search_type=live&dynamic_offset=0&web_location=1430654`;
    params = utils.addWbiVerifyInfo(params, wbiVerifyString);

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/wbi/search/type?${params}`,
        headers: {
            Referer: `https://search.bilibili.com/live?keyword=${urlEncodedKey}&from_source=webtop_search&spm_id_from=444.7&search_source=3&search_type=live_room`,
            Cookie: await cache.getCookie(),
        },
    });
    const data = response.data.data.result.live_room;

    return {
        title: `哔哩哔哩直播-${key}-${orderTitle}`,
        link: `https://search.bilibili.com/live?keyword=${urlEncodedKey}&order=${order}&coverType=user_cover&page=1&search_type=live`,
        description: `哔哩哔哩直播-${key}-${orderTitle}`,
        item:
            data &&
            data.map((item) => ({
                title: `${item.uname} ${item.title} (${item.cate_name}-${item.live_time})`,
                description: `${item.uname} ${item.title} (${item.cate_name}-${item.live_time})`,
                pubDate: new Date(item.live_time.replace(' ', 'T') + '+08:00').toUTCString(),
                guid: `https://live.bilibili.com/${item.roomid} ${item.live_time}`,
                link: `https://live.bilibili.com/${item.roomid}`,
            })),
    };
}
