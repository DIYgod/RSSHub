import { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { Context } from 'hono';

export const route: Route = {
    path: '/blog/:topic?',
    categories: ['blog'],
    example: '/ceph/blog/a11y',
    parameters: {
        category: 'filter blog post by category, return all posts if not specified',
    },
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
            source: ['ceph.io/'],
        },
    ],
    name: 'Blog',
    maintainers: ['pandada8'],
    handler,
    url: 'ceph.io',
};

async function handler(ctx: Context): Promise<Data> {
    const { category } = ctx.req.param();
    const url = category ? `https://ceph.io/en/news/blog/category/${category}/` : 'https://ceph.io/en/news/blog/';
    const response = await got.get(url);
    const data = response.data;
    const $ = load(data);
    const list = $('#main .section li')
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('a').text().trim();
            const pubDate = parseDate(element.find('time').attr('datetime'));
            return {
                title,
                link: new URL(element.find('a').attr('href'), 'https://ceph.io').href,
                pubDate,
            };
        });

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const itemReponse = await got.get(item.link);
                const data = itemReponse.data;
                const item$ = load(data);

                item.author = item$('#main section > div:nth-child(1) span').text().trim();
                item.description = item$('#main section > div:nth-child(2) > div').html();
                return item;
            })
        )
    );

    return {
        title: 'Ceph Blog',
        link: url,
        item: result,
    };
}
