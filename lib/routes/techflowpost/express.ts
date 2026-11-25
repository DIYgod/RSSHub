import type { Route } from '@/types';
import { ViewType } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { getNewsflashItems, rootUrl } from './utils';

export const route: Route = {
    path: '/express',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/techflowpost/express',
    radar: [
        {
            source: ['techflowpost.com/zh-CN/newsletter'],
        },
    ],
    name: '快讯',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    maintainers: ['nczitzk'],
    handler,
    url: 'techflowpost.com/zh-CN/newsletter',
};

async function handler(ctx) {
    const currentUrl = `${rootUrl}/zh-CN/newsletter`;
    const items = await getNewsflashItems(getRouteLimit(ctx, 50));

    return {
        title: '深潮TechFlow - 快讯',
        link: currentUrl,
        item: items,
    };
}
