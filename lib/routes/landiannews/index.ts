import { Data, DataItem, Route, ViewType } from '@/types';
import { fetchNewsItems } from './utils';

export const handler = async (): Promise<Data> => {
    const rootUrl = 'https://www.landiannews.com/';
    const postApiUrl = `${rootUrl}wp-json/wp/v2/posts?_embed=author,wp:term`;

    const items: DataItem[] = await fetchNewsItems(postApiUrl);

    return {
        title: '蓝点网',
        description: '给你感兴趣的内容!',
        link: rootUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/',
    name: '首页',
    url: 'www.landiannews.com',
    maintainers: ['nczitzk', 'cscnk52'],
    handler,
    example: '/landiannews',
    parameters: undefined,
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
            source: ['www.landiannews.com'],
            target: '/',
        },
    ],
    view: ViewType.Articles,
};
