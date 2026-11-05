import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parsePublicationDate(value?: string) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

export const route: Route = {
    path: '/libNews',
    categories: ['university'],
    example: '/hhu/libNews',
    name: '图书馆 - 通知公告',
    maintainers: ['plusmultiply0'],
    handler,
    url: 'lib.hhu.edu.cn',
};

const host = 'https://lib.hhu.edu.cn';

async function handler() {
    const pageId = '434578';
    const entryUrl = `${host}/engine2/m/E099EC04BBDF9665?p=${pageId}`;
    const entry = await ofetch(entryUrl);
    const sign = entry.match(/var sign = "(\w+)"/)![1];
    const engineInstanceId = entry.match(/var engineInstanceId = (\d+)/)![1];
    const typeId = entry.match(/var typeId = "(\d+)"/)![1];
    const appId = entry.match(/"appId":(\d+)/)![1];

    const response = await ofetch(`${host}/engine2/general/${appId}/type/more-datas`, {
        method: 'POST',
        body: new URLSearchParams({
            engineInstanceId,
            sign,
            pageNum: '1',
            pageSize: '20',
            typeId,
            typeDataSort: '-1',
        }),
    });

    const list = response.data.datas.datas.map((item) => ({
        title: item['1'].value,
        link: `${host}/engine2/d/${item.id}/${engineInstanceId}/0?t=${typeId}&p=${pageId}`,
        pubDate: parsePublicationDate(item['6']?.value),
        image: item['0'].value ? new URL(item['0'].value, host).href : undefined,
    }));

    const items = await pMap(
        list,
        async (item: (typeof list)[number]) => ({
            ...item,
            ...(await cache.tryGet(item.link, async () => {
                const detail = await ofetch(item.link);
                const description = JSON.parse(detail.match(/^\s*data: (\{"engineInstanceId":.*\}),$/m)![1]).content;
                return { description };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '河海大学图书馆 - 通知公告',
        link: entryUrl,
        item: items,
    };
}
