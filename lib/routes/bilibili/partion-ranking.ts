// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');
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

export default async (ctx) => {
    const tid = ctx.req.param('tid');
    const days = ctx.req.param('days') ?? 7;
    const disableEmbed = ctx.req.param('disableEmbed');

    const responseApi = `https://api.bilibili.com/x/web-interface/newlist?ps=15&rid=${tid}&_=${Date.now()}`;

    const response = await got_ins.get(responseApi);
    const items = [];
    let name = '未知';
    let list = {};

    list = response.data.data.archives;
    if (list && list[0] && list[0].tname) {
        name = list[0].tname;
    }

    const time_from = formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * days)); // n天前的日期
    const time_to = formatDate(new Date()); // 今天的日期
    const HotRankResponseApi = `https://s.search.bilibili.com/cate/search?main_ver=v3&search_type=video&view_type=hot_rank&cate_id=${tid}&time_from=${time_from}&time_to=${time_to}&_=${Date.now()}`;
    const HotRankResponse = await got_ins.get(HotRankResponseApi);
    const hotlist = HotRankResponse.data.result;

    for (let item of hotlist) {
        item = {
            title: item.title,
            description: `${item.description}${disableEmbed ? '' : `<br><br>${utils.iframe(item.id)}`}<br><img src="https:${item.pic}"><br/>Tags:${item.tag}`,
            pubDate: new Date(item.pubdate).toUTCString(),
            link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.id}`,
            author: item.author,
        };
        items.push(item);
    }

    ctx.set('data', {
        title: `bilibili ${name} 最热视频`,
        link: 'https://www.bilibili.com',
        description: `bilibili ${name}分区 最热视频`,
        item: items,
    });
};
