import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/zxxw',
    categories: ['government'],
    example: '/ncsc/zxxw',
    parameters: {},
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
            source: ['www.ncsc.org.cn/xwdt/zxxw'],
        },
    ],
    name: '最新新闻',
    maintainers: ['lijhdev'],
    handler,
    url: 'www.ncsc.org.cn',
};

async function handler() {
    const baseUrl = 'http://www.ncsc.org.cn';
    const linkUrl = `${baseUrl}/xwdt/zxxw/`;
    const response = await ofetch(linkUrl);
    const $ = load(response);
    const list = $('.alist li')
        .toArray()
        .map((item) => {
            const a = $(item).find('a');
            const href = a.attr('href');
            return {
                title: a.text(),
                link: `${linkUrl}${href}` || href,
                pubDate: parseDate($(item).find('span').text()),
            };
        })
        .filter((item) => item.link);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const $ = load(await ofetch(item.link));
                const content = $('.content');
                content.find('img[src^="data:"]').remove();
                return {
                    ...item,
                    description: content.html()!,
                };
            })
        )
    );

    return {
        title: '国家应对气候变化战略研究和国际合作中心',
        link: baseUrl,
        item: items,
    };
}
