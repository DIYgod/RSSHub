import { Route, Data } from '@/types';
import { getPosts } from './utils';
import got from '@/utils/got';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['multimedia'],
    example: '/chikubi/search/ギャップ',
    parameters: { keyword: 'Keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
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
    const searchResults = response.data;

    const postIds = searchResults.map((item) => item.id.toString());
    const items = await getPosts(postIds);

    return {
        title: `Search: ${keyword} - chikubi.jp`,
        link: `${baseUrl}/search/${encodeURIComponent(keyword)}`,
        item: items,
    };
}
