import { Route, Data } from '@/types';
import { fetchImages } from './image';

export const route: Route = {
    path: '/observation/wind',
    categories: ['forecast'],
    example: '/nmc/observation/wind',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '风',
    maintainers: ['dousha'],
    handler,
    url: 'nmc.cn/publish/observations/index.html',
};

async function handler(): Promise<Data> {
    const url = 'http://www.nmc.cn/publish/observations/hourly-winds.html';

    const title = '逐时风';
    const imageItem = await fetchImages(url, title);
    const data: Data = {
        title: '逐时风',
        link: url,
        description: '逐时风',
        item: imageItem,
    };

    return data;
}
