import { Route, Data } from '@/types';
import { getBySlug, getPostsBy } from './utils';

export const route: Route = {
    path: '/tag/:keyword',
    categories: ['multimedia'],
    example: '/chikubi/tag/ドリームチケット',
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
    name: 'Tag',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Tag',
            source: ['chikubi.jp/tag/:keyword'],
            target: '/tag/:keyword',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    const baseUrl = 'https://chikubi.jp';
    const { keyword } = ctx.req.param();
    const { id, name } = await getBySlug('tag', keyword);

    const items = await getPostsBy('tag', id);

    return {
        title: `Tag: ${name} - chikubi.jp`,
        link: `${baseUrl}/category/${keyword}`,
        item: items,
    };
}
