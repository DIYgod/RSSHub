import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.bjsk.org.cn';

export const route: Route = {
    path: '/:path?',
    categories: ['study'],
    example: '/bjsk/newslist-1394-1474-0',
    parameters: { path: '路径，默认为 `newslist-1486-0-0`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '通用',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { path = 'newslist-1486-0-0' } = ctx.req.param();
    const link = `${baseUrl}/${path}.html`;
    const { data: response } = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(response);

    const list = $('.article-list a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: `${baseUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('.time').text(), 'YYYY.MM.DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $ = load(response);
                item.description = $('.article-main').html();
                item.author = $('.info')
                    .text()
                    .match(/作者：(.*)\s+来源/)[1];
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        image: 'https://www.bjsk.org.cn/favicon.ico',
        item: items,
    };
}
