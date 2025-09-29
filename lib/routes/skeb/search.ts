import { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { processWork, baseUrl } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['picture'],
    example: '/skeb/search/初音ミク',
    parameters: { keyword: 'Search keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Search Results',
    maintainers: ['SnowAgar25'],
    handler,
    description: 'Get the search results for works on Skeb',
};

async function handler(ctx): Promise<Data> {
    const keyword = ctx.req.param('keyword');

    if (!keyword) {
        throw new InvalidParameterError('Invalid search keyword');
    }

    const url = 'https://hb1jt3kre9-dsn.algolia.net/1/indexes/*/queries';

    const items = await cache.tryGet(`skeb:search:${keyword}`, async () => {
        const data = await ofetch(url, {
            method: 'POST',
            headers: {
                'x-algolia-application-id': 'HB1JT3KRE9',
                'x-algolia-api-key': '9a4ce7d609e71bf29e977925e4c6740c',
            },
            body: {
                requests: [
                    {
                        indexName: 'User',
                        query: keyword,
                        params: 'hitsPerPage=40',
                        filters: 'genres:art OR genres:comic OR genres:voice OR genres:novel OR genres:video OR genres:music OR genres:correction',
                    },
                    {
                        indexName: 'Request',
                        query: keyword,
                        params: 'hitsPerPage=40&filters=genre%3Aart%20OR%20genre%3Acomic%20OR%20genre%3Avoice%20OR%20genre%3Anovel%20OR%20genre%3Avideo%20OR%20genre%3Amusic%20OR%20genre%3Acorrection',
                    },
                ],
            },
        });

        if (!data || !data.results || !Array.isArray(data.results) || data.results.length < 2) {
            throw new Error('Invalid data received from API');
        }

        const works = data.results[1].hits;

        if (!Array.isArray(works)) {
            throw new TypeError('Invalid hits data received from API');
        }

        return works.map((item) => processWork(item)).filter(Boolean);
    });

    return {
        title: `Skeb - Search Results for "${keyword}"`,
        link: `${baseUrl}/search?q=${encodeURIComponent(keyword)}`,
        item: items as DataItem[],
    };
}
