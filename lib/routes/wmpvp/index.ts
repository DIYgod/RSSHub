import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:type',
    categories: ['game'],
    example: '/wmpvp/news/1',
    parameters: { type: '资讯分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '资讯列表',
    maintainers: ['tssujt'],
    handler,
    description: `| DOTA2 | CS2 |
  | ----- | --- |
  | 1     | 2   |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    const response = await got({
        method: 'get',
        url: `https://appengine.wmpvp.com/steamcn/community/homepage/getHomeInformation?gameTypeStr=${type}&pageNum=1&pageSize=20`,
    });
    const data = response.data.result.filter((item) => item.news !== undefined);

    const items = data.map((item) => {
        const entity = item.news;
        const newsId = entity.newsId;
        const newsLink = `https://news.wmpvp.com/news.html?id=${newsId}&gameTypeStr=${type}`;

        // 最终需要返回的对象
        return {
            title: entity.title,
            pubDate: parseDate(entity.publishTime),
            link: newsLink,
            guid: newsLink,
            description: entity.summary,
            author: entity.author,
        };
    });

    return {
        title: `完美世界电竞`,
        link: `https://news.wmpvp.com/`,
        item: items,
    };
}
