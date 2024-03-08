import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseURL = 'https://yysub.net';

export const route: Route = {
    path: '/article/:type?',
    categories: ['picture'],
    example: '/yyets/article',
    parameters: { type: '[' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '影视资讯',
    maintainers: ['wb121017405'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? '';
    const url = `${baseURL}/article${type ? '?type=' + type : ''}`;

    const response = await got(url);
    const $ = load(response.data);

    let items = $('.article-list li .fl-info')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('h3 a').text(),
                link: `${baseURL}${e.find('h3 a').attr('href')}`,
                author: e.find('p a').text(),
                pubDate: timezone(parseDate(e.find('p').eq(2).text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('.information-desc').html();
                return item;
            })
        )
    );

    return {
        title: `${$('title').text()} - 人人影视`,
        description: $('meta[name="description"]').attr('content'),
        link: url,
        item: items,
    };
}
