import { randomUUID } from 'node:crypto';

import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/open/announce',
    categories: ['programming'],
    example: '/ele.me/open/announce',
    name: '商家开放平台公告',
    maintainers: ['phantomk'],
    handler,
};

interface Notice {
    templateId: string | number;
    title: string;
    beginDate: string;
    content: string;
}

function getNoticeData<T>(method: string, params: { templateId: string } | { offset: number; limit: number }) {
    return ofetch<{ code: number; result: T }>(`https://app-api.shop.ele.me/arena/invoke/?method=NoticeKeeperService.${method}`, {
        method: 'POST',
        body: {
            id: `${randomUUID().replaceAll('-', '').toUpperCase()}|${Temporal.Now.instant().epochMilliseconds}`,
            metas: {
                appName: 'Odin',
                appVersion: '4.4.0',
            },
            service: 'NoticeKeeperService',
            method,
            params,
            ncp: '2.0.0',
        },
    });
}

async function getNoticeContent(templateId: string | number) {
    const data = await getNoticeData<Notice>('getBroadcastByTemplateId', { templateId: String(templateId) });
    return data.result.content;
}

async function handler() {
    const data = await getNoticeData<{ broadcastList: Notice[] }>('getBroadcastList', { offset: 0, limit: 999 });
    const items = await pMap(
        data.result.broadcastList,
        async (item) => {
            const description = await cache.tryGet(`ele.me:notice-content:${item.templateId}`, () => getNoticeContent(item.templateId));
            return {
                title: item.title,
                description,
                pubDate: parseDate(item.beginDate, 8),
                link: `https://open.shop.ele.me/common/publicnotice/${item.templateId}`,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '饿了么商家开放平台-公告',
        link: 'https://open.shop.ele.me/common/publicnotice/0',
        item: items,
    };
}
