import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://www.ulapia.com';

const researchList = ['stock_research', 'industry_research', 'strategy_research', 'macro_research', 'ipo_research'];

export const route: Route = {
    path: '/research/latest',
    categories: ['finance'],
    example: '/ulapia/research/latest',
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
            source: ['www.ulapia.com/'],
        },
    ],
    name: '最新研报',
    maintainers: [],
    handler,
    url: 'www.ulapia.com/',
};

async function handler() {
    const items = await Promise.all(
        researchList.map((item) => {
            const url = `${rootUrl}/reports/${item}`;

            return cache.tryGet(url, async () => {
                const response = await got.get(url);
                const $ = load(response.data);
                const items = $('div.row > div.col-md-6')
                    .slice(0, 6)
                    .map((_, item) => ({
                        title: `${$(item).find('strong').text()}  ${$(item).find('h5.mb-1').text()}`,
                        author: $(item).find('div.col.p-8.d-flex.px-3.py-3.flex-column.position-static > div:nth-child(4) > span:nth-child(2)').text(),
                        link: $(item).find('h5.mb-1 > a').attr('href'),
                        description: `<img src="${$(item).find('img').attr('src').split('!')[0]}">`,
                        pubDate: parseDate($(item).find('div.mb-0.text-muted').last().text().split(':')[1], 'YYYY-MM-DD'),
                    }))
                    .get();

                return items;
            });
        })
    );

    return {
        title: 'Ulapia - 最新研报',
        link: rootUrl,
        item: items.flat(),
    };
}
