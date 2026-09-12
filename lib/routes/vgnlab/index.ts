import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['game'],
    example: '/vgnlab',
    radar: [
        {
            source: ['www.vgnlab.com.cn/web/news'],
        },
    ],
    name: '新闻中心',
    maintainers: ['wyangx'],
    handler,
    url: 'www.vgnlab.com.cn/web/news',
};

async function handler() {
    const baseUrl = 'https://www.vgnlab.com.cn';

    const { data } = await ofetch(`${baseUrl}/api/news/list`, {
        method: 'POST',
        body: {
            app_type: 'pc',
            app_type_name: 'PC',
            page: 1,
            page_size: 12,
        },
    });

    const list = [data.top, ...data.list]
        .filter((item) => item?.id)
        .map((item): DataItem & { link: string } => ({
            title: item.title,
            link: `${baseUrl}/web/news-${item.id}`,
            pubDate: parseDate(item.publish_time * 1000),
            image: item.img_url,
            id: item.id,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await ofetch(`${baseUrl}/api/news/detail`, {
                    method: 'POST',
                    body: {
                        app_type: 'pc',
                        app_type_name: 'PC',
                        id: item.id,
                    },
                });
                item.description = data.content;
                return item;
            })
        )
    );

    return {
        title: 'VGN官网 - 新闻中心',
        link: `${baseUrl}/web/news`,
        item: items,
    };
}
