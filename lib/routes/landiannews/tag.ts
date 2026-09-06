import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';

import { fetchNewsItems, fetchTag } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const slug = ctx.req.param('slug');

    const { id, name } = await fetchTag(slug);

    const rootUrl = 'https://www.landiannews.com/';
    const postApiUrl = `${rootUrl}wp-json/wp/v2/posts?_embed=author,wp:term&tags=${id}`;

    const items: DataItem[] = await fetchNewsItems(postApiUrl);

    return {
        title: `${name} - 蓝点网`,
        description: '给你感兴趣的内容!',
        link: `${rootUrl}archives/tag/${slug}`,
        item: items,
    };
};

export const route: Route = {
    path: '/tag/:slug',
    name: '标签',
    url: 'www.landiannews.com',
    maintainers: ['cscnk52'],
    handler,
    example: '/landiannews/tag/linux-kernel',
    parameters: { slug: '标签名称' },
    description: undefined,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.landiannews.com/archives/tag/:slug'],
            target: '/tag/:slug',
        },
    ],
    view: ViewType.Articles,
};
