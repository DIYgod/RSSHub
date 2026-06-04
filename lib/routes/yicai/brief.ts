import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
    const apiUrl = `${rootUrl}/api/ajax/getbrieflist?type=0&page=1&pagesize=${ctx.req.query('limit') ?? 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.map((item) => ({
        title: item.indexTitle,
        link: `${rootUrl}${item.url}`,
        description: item.newcontent,
        pubDate: timezone(parseDate(`${item.datekey} ${item.hm}`, 'YYYY.MM.DD HH:mm'), +8),
    }));

    return {
        title: '第一财经 - 正在',
        link: currentUrl,
        item: items,
    };
}
