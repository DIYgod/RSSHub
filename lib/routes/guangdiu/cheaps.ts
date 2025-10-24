import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

const host = 'https://guangdiu.com';

export const route: Route = {
    path: '/cheaps/:query?',
    categories: ['shopping'],
    example: '/guangdiu/cheaps/k=clothes',
    parameters: { query: '链接参数，对应网址问号后的内容' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '九块九',
    maintainers: ['fatpandac'],
    handler,
};

async function handler(ctx) {
    const query = ctx.req.param('query') ?? '';
    const url = `${host}/cheaps.php${query ? `?${query}` : ''}`;

    const response = await got(url);
    const $ = load(response.data);

    const items = $('div.cheapitem.rightborder')
        .toArray()
        .map((item) => ({
            title: $(item).find('div.cheaptitle').text().trim() + $(item).find('a.cheappriceword').text(),
            link: $(item).find('a.cheappriceword').attr('href'),
            description: $(item).find('div.cheapimga').html(),
            pubDate: parseRelativeDate($(item).find('span.cheapaddtimeword').text()),
        }));

    return {
        title: `逛丢 - 九块九`,
        link: url,
        item: items,
    };
}
