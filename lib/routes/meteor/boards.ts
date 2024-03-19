import { Route } from '@/types';
import cache from '@/utils/cache';
import { baseUrl, getBoards } from './utils';

export const route: Route = {
    path: '/boards',
    categories: ['bbs'],
    example: '/meteor/boards',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['meteor.today/'],
        },
    ],
    name: '看板列表',
    maintainers: ['TonyRL'],
    handler,
    url: 'meteor.today/',
};

async function handler() {
    const items = await getBoards(cache.tryGet);

    return {
        title: '看板列表',
        link: `${baseUrl}/board/all`,
        item: items,
    };
}
