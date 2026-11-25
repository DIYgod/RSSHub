import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderDescription } from './templates/description';
import { rootUrl } from './utils';

export const route: Route = {
    path: '/brief',
    categories: ['traditional-media'],
    example: '/yicai/brief',
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
            source: ['yicai.com/brief'],
        },
    ],
    name: '正在',
    maintainers: ['sanmmm', 'nczitzk'],
    handler,
    url: 'yicai.com/brief',
};

async function handler(ctx) {
    const currentUrl = `${rootUrl}/brief`;
    const apiUrl = `${rootUrl}/api/ajax/getbrieflist?type=0&page=1&pagesize=${getRouteLimit(ctx, 50)}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.map((item) => ({
        title: item.indexTitle,
        link: `${rootUrl}${item.url}`,
        description: renderDescription({
            intro: item.LiveContent,
            image: { src: item.LiveImages },
        }),
        pubDate: parseDate(item.CreateDate, 8),
    }));

    return {
        title: '第一财经 - 正在',
        link: currentUrl,
        item: items,
    };
}
