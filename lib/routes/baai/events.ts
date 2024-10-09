import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { baseUrl, apiHost, parseEventDetail, parseItem } from './utils';

export const route: Route = {
    path: '/hub/events',
    categories: ['programming'],
    example: '/baai/hub/events',
    radar: [
        {
            source: ['hub.baai.ac.cn/events', 'hub.baai.ac.cn/'],
        },
    ],
    name: '智源社区 - 活动',
    maintainers: ['TonyRL'],
    handler,
    url: 'hub.baai.ac.cn/events',
};

async function handler() {
    const response = await ofetch(`${apiHost}/api/v1/events`, {
        method: 'POST',
        body: {
            page: 1,
            tag_id: '',
        },
    });

    const list = response.data.map((item) => parseItem(item));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                item.description = await parseEventDetail(item);
                return item;
            })
        )
    );

    return {
        title: '活动 - 智源社区',
        link: `${baseUrl}/events`,
        item: items,
    };
}
