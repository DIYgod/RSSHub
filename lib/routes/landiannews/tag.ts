import { Data, DataItem, Route, ViewType } from '@/types';
import { fetchNewsItems, fetchTag } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const id = ctx.req.param('id');
    const rootUrl = 'https://www.landiannews.com/';
    const postApiUrl = `${rootUrl}wp-json/wp/v2/posts?_embed&tags=${id}`;

    const items: DataItem[] = await fetchNewsItems(postApiUrl);

    const name = (await fetchTag([id]))[0];

    return {
        title: `${name} - 蓝点网`,
        description: '给你感兴趣的内容!',
        link: String(rootUrl),
        item: items,
    };
};

export const route: Route = {
    path: '/tag/:id',
    name: '标签',
    url: 'www.landiannews.com',
    maintainers: ['cscnk52'],
    handler,
    example: '/landiannews/tag/118',
    parameters: { id: '标签 id' },
    description: undefined,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    view: ViewType.Articles,
};
