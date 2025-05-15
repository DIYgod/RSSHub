import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/topic/:id',
    categories: ['new-media', 'popular'],
    example: '/panewslab/topic/1629365774078402',
    parameters: { id: '专题 id，可在地址栏 URL 中找到' },
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
            source: ['panewslab.com/'],
        },
    ],
    name: '专题',
    maintainers: ['nczitzk'],
    handler,
    url: 'panewslab.com/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/webapi/subject/articles?Rn=${ctx.req.query('limit') ?? 25}&LId=1&sid=${id}&tw=0`;
    const currentUrl = `${rootUrl}/zh/topiclist/${id}.html`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.map((item) => ({
        title: item.title,
        author: item.author.name,
        pubDate: parseDate(item.publishTime * 1000),
        link: `${rootUrl}/zh/articledetails/${item.id}.html`,
        description: `<blockquote>${item.desc}</blockquote>`,
        category: item.tags,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description += content('#txtinfo').html();

                return item;
            })
        )
    );

    return {
        title: `PANews - ${id}`,
        link: currentUrl,
        item: items,
    };
}
