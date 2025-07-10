import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/post/:language?/:keyword?',
    categories: ['programming'],
    example: '/atcoder/post',
    parameters: { language: 'Language, `jp` as Japanese or `en` as English, English by default', keyword: 'Keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Posts',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'en';
    const keyword = ctx.req.param('keyword') ?? '';

    const rootUrl = 'https://atcoder.jp';
    const currentUrl = `${rootUrl}/posts?lang=${language}${keyword ? `&keyword=${keyword}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.panel')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.panel-title').text(),
                description: item.find('.panel-body').html(),
                link: `${rootUrl}${item.find('.panel-title a').attr('href')}`,
                pubDate: timezone(parseDate(item.find('.timeago').attr('datetime')), +9),
            };
        });

    return {
        title: `${keyword ? `[${keyword}] - ` : ''}${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
}
