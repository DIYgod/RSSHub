import { Route, ViewType } from '@/types';

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weekly',
    categories: ['anime', 'popular'],
    view: ViewType.Articles,
    example: '/cngal/weekly',
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
            source: ['www.cngal.org/', 'www.cngal.org/weeklynews'],
        },
    ],
    name: '每周速报',
    maintainers: ['kmod-midori'],
    handler,
    url: 'www.cngal.org/',
};

async function handler() {
    const response = await got('https://api.cngal.org/api/news/GetWeeklyNewsOverview');

    return {
        title: 'CnGal - 每周速报',
        link: 'https://www.cngal.org/weeklynews',
        item: response.data.map((item) => ({
            title: item.name,
            description: art(path.join(__dirname, 'templates/weekly-description.art'), item),
            pubDate: parseDate(item.lastEditTime),
            link: `https://www.cngal.org/articles/index/${item.id}`,
        })),
    };
}
