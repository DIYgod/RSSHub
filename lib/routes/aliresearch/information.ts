import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/information/:type?',
    categories: ['new-media'],
    example: '/aliresearch/information',
    parameters: { type: '类型，见下表，默认为新闻' },
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
            source: ['aliresearch.com/cn/information', 'aliresearch.com/'],
            target: '/information',
        },
    ],
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    url: 'aliresearch.com/cn/information',
    description: `| 新闻 | 观点 | 案例 |
| ---- | ---- | ---- |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? '新闻';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'http://www.aliresearch.com';
    const currentUrl = `${rootUrl}/cn/information`;
    const apiUrl = `${rootUrl}/ch/listArticle`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            pageNo: 1,
            pageSize: 10,
            type,
        },
    });

    let items = response.data.data.slice(0, limit).map((item) => ({
        title: item.articleCode,
        author: item.author,
        pubDate: timezone(parseDate(item.gmtCreated), +8),
        link: `${rootUrl}/ch/information/informationdetails?articleCode=${item.articleCode}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: `${rootUrl}/ch/getArticle`,
                    json: {
                        articleCode: item.title,
                    },
                });

                const data = detailResponse.data.data;

                item.title = data.title;
                item.description = data.content;
                item.category = data.special.split(',');

                return item;
            })
        )
    );

    return {
        title: `阿里研究院 - ${type}`,
        link: currentUrl,
        item: items,
    };
}
