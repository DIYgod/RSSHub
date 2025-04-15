import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

type CoolPcArticle = {
    title: string;
    description: string;
    link: string | undefined;
    pubDate: Date;
};

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

    const distinctItems: CoolPcArticle[] = [];
    for (const item of $('#content article').toArray()) {
        const title = $(item).find('h3 a').text();
        if (distinctItems.filter((i) => i.title === title).length === 0) {
            distinctItems.push({
                title,
                description: $(item).find('.ultimate-layouts-excerpt').text(),
                link: $(item).find('h3 a').attr('href'),
                pubDate: parseDate($(item).find('span').text(), 'YYYY/MM/DD'),
            });
        }
    }

    return {
        title: '原價屋 - 促銷&開箱',
        link: currentUrl,
        item: distinctItems,
    };
}
