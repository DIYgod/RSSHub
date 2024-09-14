import { Route, Data } from '@/types';
import { processItems } from './utils';
import got from '@/utils/got';

interface SearchItem {
    title: string;
    url: string;
}

export const route: Route = {
    path: '/search/:keyword',
    categories: ['multimedia'],
    example: '/chikubi/search/電流',
    parameters: { keyword: 'Keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['SnowAgar25'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { keyword } = ctx.req.param();
    const baseUrl = 'https://chikubi.jp';
    const searchUrl = `${baseUrl}/wp-json/wp/v2/search?search=${keyword}`;

    const response = await got.get(searchUrl);
    const searchResults: SearchItem[] = response.data;

    const list = searchResults.map((item) => ({
        title: item.title,
        link: item.url,
    }));

    const items = await processItems(list);

    return {
        title: `Search: ${keyword} - chikubi.jp`,
        link: `${baseUrl}/search/${encodeURIComponent(keyword)}`,
        item: items,
    };
}
