import { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['shopping'],
    example: '/coolpc/news',
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
            source: ['www.coolpc.com.tw/'],
        },
    ],
    name: '促銷&開箱',
    maintainers: ['david90103'],
    handler,
    url: 'www.coolpc.com.tw/',
};

async function handler() {
    const rootUrl = 'https://www.coolpc.com.tw/';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);

    const $ = load(response.data);

    const distinctItems: DataItem[] = $('#content article')
        .toArray()
        .map((item) => ({
            title: $(item).find('h3 a').text(),
            description: $(item).find('.ultimate-layouts-excerpt').text(),
            link: $(item).find('h3 a').attr('href'),
            pubDate: parseDate($(item).find('.ultimate-layouts-metas-wrap span').eq(1).text(), 'YYYY/MM/DD'),
        }))
        .filter((item, index, self) => index === self.findIndex((i) => i.title === item.title));

    return {
        title: '原價屋 - 促銷&開箱',
        link: currentUrl,
        item: distinctItems,
    };
}
