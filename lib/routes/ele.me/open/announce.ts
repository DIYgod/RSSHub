import { randomUUID } from 'node:crypto';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/open/announce',
    categories: ['programming'],
    example: '/ele.me/open/announce',
    name: '商家开放平台公告',
    maintainers: ['phantomk'],
    handler,
};

async function handler() {
    const data = await ofetch('https://app-api.shop.ele.me/arena/invoke/?method=NoticeKeeperService.getBroadcastList', {
        method: 'POST',
        body: {
            id: `${randomUUID().replaceAll('-', '').toUpperCase()}|${Date.now()}`,
            metas: {
                appName: 'Odin',
                appVersion: '4.4.0',
            },
            service: 'NoticeKeeperService',
            method: 'getBroadcastList',
            params: {
                offset: 0,
                limit: 999,
            },
            ncp: '2.0.0',
        },
    });

    return {
        title: '饿了么商家开放平台-公告',
        link: 'https://open.shop.ele.me/common/publicnotice/0',
        item: data.result.broadcastList.map((item) => ({
            title: item.title,
            description: '',
            pubDate: item.beginDate ? timezone(parseDate(item.beginDate), 8) : undefined,
            link: `https://open.shop.ele.me/common/publicnotice/${item.templateId}`,
        })),
    };
}
