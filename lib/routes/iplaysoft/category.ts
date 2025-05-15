import { Data, DataItem, Route, ViewType } from '@/types';
import { fetchNewsItems, fetchCategory } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const slug = ctx.req.param('slug');

    const { id, name } = await fetchCategory(slug);

    const rootUrl = 'https://www.iplaysoft.com/';
    const postApiUrl = `${rootUrl}wp-json/wp/v2/posts?_embed&categories=${id}`;

    const items: DataItem[] = await fetchNewsItems(postApiUrl);

    return {
        title: `${name} - 异次元软件世界`,
        description: '软件改变生活',
        language: 'zh-CN',
        link: `${rootUrl}category/${slug}`,
        item: items,
    };
};

export const route: Route = {
    path: '/category/:slug',
    name: '分类',
    url: 'www.iplaysoft.com',
    maintainers: ['cscnk52'],
    handler,
    example: '/iplaysoft/category/system',
    parameters: { slug: '分类名称' },
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
            source: ['www.iplaysoft.com/category/:slug'],
            target: '/category/:slug',
        },
    ],
    view: ViewType.Articles,
};
