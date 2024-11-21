import { Route, ViewType } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

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
    maintainers: ['chengyuhui'],
    handler,
    url: 'www.cngal.org/',
};

async function handler(ctx) {
    const response = await got('https://www.cngal.org/api/news/GetWeeklyNewsOverview');

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
    ctx.state.json = response.data;
}
