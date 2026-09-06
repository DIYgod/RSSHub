import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route = {
    path: '/information',
    categories: ['travel'],
    example: '/lnmuseum/information',
    params: {},
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
                _t: Date.now(),
            },
        });

        const data = response.data.result;

        const items = data.map((item) => {
            const itemLink = `${baseUrl}/#/about/detail?id=${item.id}&pageType=2`;

            return {
                title: item.title,
                pubDate: timezone(parseDate(item.createTime), 8),
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
