import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/clarification',
    categories: ['government'],
    example: '/mohw/clarification',
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
            source: ['mohw.gov.tw/'],
        },
    ],
    name: '即時新聞澄清',
    maintainers: ['nczitzk'],
    handler,
    url: 'mohw.gov.tw/',
};

async function handler() {
    const rootUrl = 'https://www.mohw.gov.tw';
    const currentUrl = `${rootUrl}/lp-17-1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.list01 a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('article').html();
                item.pubDate = parseDate(content('meta[name="DC.Date"]').attr('datetime'));

                return item;
            })
        )
    );

    return {
        title: '即時新聞澄清 - 台灣衛生福利部',
        link: currentUrl,
        item: items,
    };
}
