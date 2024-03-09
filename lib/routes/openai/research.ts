import { Route } from '@/types';
import got from '@/utils/got';
import { getApiUrl, parseArticle } from './common';

export const route: Route = {
    path: '/research',
    categories: ['new-media'],
    example: '/openai/research',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Research',
    maintainers: ['yuguorui'],
    handler,
};

async function handler(ctx) {
    const apiUrl = new URL('/api/v1/research-publications', await getApiUrl());
    const researchRootUrl = 'https://openai.com/research';

    // Construct API query
    apiUrl.searchParams.append('sort', '-publicationDate,-createdAt');
    apiUrl.searchParams.append('include', 'media');

    const resp = await got({
        method: 'get',
        url: apiUrl,
    });
    const obj = resp.data;

    const items = await Promise.all(
        obj.data.map((item) => {
            const attributes = item.attributes;
            return parseArticle(ctx, researchRootUrl, attributes);
        })
    );

    const title = 'OpenAI Research';

    return {
        title,
        link: researchRootUrl,
        item: items,
    };
}
