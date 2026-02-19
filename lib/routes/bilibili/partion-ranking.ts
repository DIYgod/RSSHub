import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

import utils from './utils';

const got_ins = got.extend({
    headers: {
        Referer: 'https://www.bilibili.com/',
    },
});

function formatDate(now) {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dateTime = year + '' + (month >= 10 ? month : '0' + month) + '' + (date >= 10 ? date : '0' + date);
    return dateTime;
}

export const route: Route = {
    path: '/partion/ranking/:tid/:days?/:embed?',
    categories: ['social-media'],
    example: '/bilibili/partion/ranking/171/3',
    parameters: { tid: '分区 id, 见上方表格', days: '缺省为 7, 指最近多少天内的热度排序', embed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分区视频排行榜',
    maintainers: ['lengthmin'],
    handler,
};

async function handler(ctx) {
    const tid = ctx.req.param('tid');
    const days = ctx.req.param('days') ?? 7;
    const embed = !ctx.req.param('embed');

    const responseApi = `https://api.bilibili.com/x/web-interface/newlist?ps=15&rid=${tid}&_=${Date.now()}`;

    const response = await got_ins.get(responseApi);
    let name = '未知';
    const list = response.data.data.archives;
    if (list && list[0] && list[0].tname) {
        name = list[0].tname;
    }

    const time_from = formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * days)); // n天前的日期
    const time_to = formatDate(new Date()); // 今天的日期
    const HotRankResponseApi = `https://s.search.bilibili.com/cate/search?main_ver=v3&search_type=video&view_type=hot_rank&cate_id=${tid}&time_from=${time_from}&time_to=${time_to}&_=${Date.now()}`;
    const HotRankResponse = await got_ins.get(HotRankResponseApi);
    const hotlist = HotRankResponse.data.result;

    const items: DataItem[] = hotlist.map((item) => ({
        title: item.title,
        description: utils.renderUGCDescription(embed, item.pic, `${item.description} - ${item.tag}`, item.id, undefined, item.bvid),
        pubDate: new Date(item.pubdate).toUTCString(),
        link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.id}`,
        author: item.author,
    }));

    return {
        title: `bilibili ${name} 最热视频`,
        link: 'https://www.bilibili.com',
        description: `bilibili ${name}分区 最热视频`,
        item: items,
    };
}
