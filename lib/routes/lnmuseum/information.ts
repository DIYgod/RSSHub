import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

import { namespace } from './namespace';

export const route: Route = {
    path: '/information',
    categories: ['travel'],
    example: '/lnmuseum/information',
    name: 'Information',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.lnmuseum.com.cn'],
            target: '/information',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://www.lnmuseum.com.cn';
        const apiUrl = `${baseUrl}/singleMuseum/webapi/information`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
            searchParams: {
                currentPage: 1,
                size: 10,
                _t: Temporal.Now.instant().epochMilliseconds,
            },
        });

        const data = response.data.result;

        const items = data.map((item) => {
            const itemLink = `${baseUrl}/#/about/detail?id=${item.id}&pageType=2`;

            return {
                title: item.title,
                pubDate: parseDate(item.createTime, 8),
                link: itemLink,
            };
        });

        return {
            title: `${museumName} - 资讯`,
            link: `${baseUrl}/#/about?pageType=2`,
            language: 'zh-CN',
            item: items,
        };
    },
};
