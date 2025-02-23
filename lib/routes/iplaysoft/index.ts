import { Data, DataItem, Route, ViewType } from '@/types';
import { fetchNewsItems } from './utils';

export const handler = async (): Promise<Data> => {
    const rootUrl = 'https://www.iplaysoft.com/';
    const postApiUrl = `${rootUrl}wp-json/wp/v2/posts?_embed`;

    const items: DataItem[] = await fetchNewsItems(postApiUrl);

    return {
        title: '异次元软件世界',
        description: '软件改变生活',
        language: 'zh-CN',
        link: rootUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/',
    name: '首页',
    url: 'www.iplaysoft.com',
    maintainers: ['williamgateszhao', 'cscnk52'],
    handler,
    example: '/iplaysoft',
    parameters: undefined,
    description: undefined,
    categories: ['program-update'],
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
            source: ['www.iplaysoft.com'],
            target: '/',
        },
    ],
    view: ViewType.Articles,
};
