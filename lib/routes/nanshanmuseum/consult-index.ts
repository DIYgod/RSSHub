import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { namespace } from './namespace';
import { getDispatcher } from './tls';

interface InformationListItem {
    resId: string;
    name: string;
    content?: string;
    createDate: number;
}

const typeConfig = {
    news: { code: 'L0409', title: '南博动态' },
    notice: { code: 'L0410', title: '通知公告' },
    procurement: { code: 'L0412', title: '政采信息' },
    affairs: { code: 'L0415', title: '馆务公开' },
} as const;

type NewsType = keyof typeof typeConfig;

const baseUrl = 'https://www.nanshanmuseum.com';
const apiHeaders = {
    'Platform-lang': '0',
    'Platform-device': '1',
};

export const route: Route = {
    path: '/consultIndex/:type',
    categories: ['travel'],
    example: '/nanshanmuseum/consultIndex/news',
    parameters: {
        type: 'News type, supported values: news（南博动态）、notice（通知公告）、procurement（政采信息）、affairs（馆务公开）',
    },
    name: 'News',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.nanshanmuseum.com/consultIndex'],
            target: '/consultIndex/news',
        },
    ],
    handler: async (ctx: Context) => {
        const newsType = ctx.req.param('type') as NewsType;
        if (!Object.hasOwn(typeConfig, newsType)) {
            throw new InvalidParameterError('Invalid type. Use news, notice, procurement or affairs.');
        }
        const { code, title: typeTitle } = typeConfig[newsType];
        const museumName = namespace.zh?.name || namespace.name;
        const listUrl = `${baseUrl}/consultIndex?id=${code}`;

        const response = await ofetch<{ data?: { list?: InformationListItem[] } }>(`${baseUrl}/api/information`, {
            dispatcher: await getDispatcher(),
            query: {
                code,
                pageNum: 1,
                pageSize: 10,
            },
            headers: apiHeaders,
        });

        const rawList = response.data?.list ?? [];
        const items: DataItem[] = rawList.map((item) => {
            const itemId = item.resId;
            const link = `${baseUrl}/consultDetail?id=${itemId}&code=${code}`;
            const pubDate = parseDate(item.createDate);

            return {
                title: item.name,
                link,
                pubDate,
                description: item.content,
            };
        });

        return {
            title: `${museumName} - ${typeTitle}`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
