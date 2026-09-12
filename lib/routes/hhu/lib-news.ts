import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
        pubDate: timezone(parseDate(item['6'].value), 8),
        image: `${host}${item['0'].value}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await ofetch(item.link);
                item.description = JSON.parse(detail.match(/^\s*data: (\{"engineInstanceId":.*\}),$/m)![1]).content;
                return item;
            })
        )
    );

    return {
        title: '河海大学图书馆 - 通知公告',
        link: entryUrl,
        item: items,
    };
}
