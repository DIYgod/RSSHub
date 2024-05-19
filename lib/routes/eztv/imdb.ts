import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/imdb/:imdbid?',
    categories: [''],
    example: '/imdb/tt0903747',
    parameters: { imdbid: 'IMBD ID 在IMDb官网地址上可以找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true``,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['eztvx.to/'],
        },
    ],
    name: 'EZTV',
    maintainers: ['whitecode'],
    handler,
    url: 'eztvx.to/',
    description: `EZTV's Torrents of IMBD ID`,
};

async function handler(ctx) {

    // 默认给到imdb排名第一的电视剧
    const imdbId = ctx.req.param('imdbid') ?? '0903747';
    const rootUrl = 'https://eztvx.to';
    const currentUrl = `${rootUrl}/get-torrents?imdb_id=${imdbId}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    

}