import { Data, DataItem, Route, ViewType } from '@/types';
import { fetchNewsItems, fetchCategory } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const id = ctx.req.param('id');
    const rootUrl = 'https://www.landiannews.com/';
    const postApiUrl = `${rootUrl}wp-json/wp/v2/posts?categories=${id}`;

    const items: DataItem[] = await fetchNewsItems(postApiUrl);

    const name = (await fetchCategory([id]))[0];

    return {
        title: `${name} - 蓝点网`,
        description: '给你感兴趣的内容!',
        link: String(rootUrl),
        item: items,
    };
};

export const route: Route = {
    path: '/category/:id',
    name: '分类',
    url: 'www.landiannews.com',
    maintainers: ['cscnk52'],
    handler,
    example: '/landiannews/category/11074',
    parameters: { id: '分类 id' },
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
