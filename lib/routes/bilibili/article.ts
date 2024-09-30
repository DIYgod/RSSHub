import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';

import { parseDate } from '@/utils/parse-date';
export const route: Route = {
    path: '/user/article/:uid',
    categories: ['social-media'],
    example: '/bilibili/user/article/334958638',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到' },
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
        },
    ],
    name: 'UP 主专栏',
    maintainers: ['lengthmin', 'Qixingchen'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const name = await cache.getUsernameFromUID(uid);
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
            const { url: art_url, description: eDescription } = await cache.getArticleDataFromCvid(item.id, uid);
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
    return {
        title,
        link,
        description,
        item,
    };
}
