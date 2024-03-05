// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');

export default async (ctx) => {
    const disableEmbed = ctx.req.param('disableEmbed');
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/popular`,
        headers: {
            Referer: 'https://www.bilibili.com/',
        },
    });
    const list = response.data.data.list;

    ctx.set('data', {
        title: `bilibili 综合热门`,
        link: 'https://www.bilibili.com',
        description: `bilibili 综合热门`,
        item:
            list &&
            list.map((item) => ({
                title: item.title,
                description: `${item.desc}${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`}<br><img src="${item.pic}">`,
                pubDate: new Date(item.pubdate * 1000).toUTCString(),
                link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: item.owner.name,
            })),
    });
};
