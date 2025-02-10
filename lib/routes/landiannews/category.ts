import { Data, DataItem, Route, ViewType } from '@/types';
import { fetchNewsItems, fetchCategory } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const slug = ctx.req.param('slug');

    const { id, name } = await fetchCategory(slug);

    const rootUrl = 'https://www.landiannews.com/';
    const postApiUrl = `${rootUrl}wp-json/wp/v2/posts?_embed&categories=${id}`;

    const items: DataItem[] = await fetchNewsItems(postApiUrl);

    return {
        title: `${name} - 蓝点网`,
        description: '给你感兴趣的内容!',
        link: `${rootUrl}${slug}`,
        item: items,
    };
};

export const route: Route = {
    path: '/category/:slug',
    name: '分类',
    url: 'www.landiannews.com',
    maintainers: ['cscnk52'],
    handler,
    example: '/landiannews/category/sells',
    parameters: { slug: '分类名称' },
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
            source: ['www.landiannews.com/:slug'],
            target: '/category/:slug',
        },
    ],
    view: ViewType.Articles,
};
