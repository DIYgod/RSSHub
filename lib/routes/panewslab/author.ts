import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/author/:id', '/column/:id'],
    categories: ['new-media'],
    example: '/panewslab/author/166',
    parameters: { id: '专栏 id，可在地址栏 URL 中找到' },
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
    name: '专栏',
    maintainers: ['nczitzk'],
    handler,
    url: 'panewslab.com/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/webapi/subject/articles?Rn=${ctx.req.query('limit') ?? 25}&LId=1&tw=0&uid=${id}`;
    const currentUrl = `${rootUrl}/zh/author/${id}.html`;

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
        title: `PANews - ${items[0].author}`,
        link: currentUrl,
        item: items,
    };
}
