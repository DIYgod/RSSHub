import { Route } from '@/types';
import got from '@/utils/got';
// import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weekly',
    categories: ['programming'],
    example: '/sec-wiki/weekly',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新周刊',
    maintainers: ['p7e4'],
    handler,
};

async function handler() {
    const { data } = await got('https://www.sec-wiki.com/weekly/index');
    const items = [...data.matchAll(/\/weekly\/(\d+)">(.+?)<\/a><\/h5>\s*<p>(.+?)<\/p>/g)].map((item) => ({
        title: item[2],
        link: `https://www.sec-wiki.com/weekly/${item[1]}`,
        description: item[3],
    }));
    return {
        title: 'SecWiki-安全维基',
        link: 'https://www.sec-wiki.com/',
        item: items,
    };
}
