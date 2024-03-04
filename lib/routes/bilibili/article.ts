// @ts-nocheck
import got from '@/utils/got';
const cache = require('./cache');

import { parseDate } from '@/utils/parse-date';
export default async (ctx) => {
    const uid = ctx.req.param('uid');
    const name = await cache.getUsernameFromUID(ctx, uid);
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/space/article?mid=${uid}&pn=1&ps=10&sort=publish_time&jsonp=jsonp`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const data = response.data.data;
    const title = `${name} 的 bilibili 专栏`;
    const link = `https://space.bilibili.com/${uid}/article`;
    const description = `${name} 的 bilibili 专栏`;
    const item = await Promise.all(
        data.articles.map(async (item) => {
            const { url: art_url, description: eDescription } = await cache.getArticleDataFromCvid(ctx, item.id, uid);
            const publishDate = parseDate(item.publish_time * 1000);
            const single = {
                title: item.title,
                link: art_url,
                description: eDescription,
                pubDate: publishDate,
            };
            return single;
        })
    );
    ctx.set('data', {
        title,
        link,
        description,
        item,
    });
};
