import pMap from 'p-map';

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

const baseUrl = 'https://www.vgnlab.com.cn';

async function handler() {
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
            pubDate: typeof item.publish_time === 'number' && Number.isFinite(item.publish_time) ? parseDate(item.publish_time * 1000) : undefined,
            image: item.img_url,
            id: item.id,
        }));

    const items = await pMap(list, getArticle, { concurrency: 3, stopOnError: false });

    return {
        title: 'VGN官网 - 新闻中心',
        link: `${baseUrl}/web/news`,
        item: items,
    };
}

async function getArticle(item: DataItem & { link: string }): Promise<DataItem> {
    const { description } = await cache.tryGet(item.link, () => fetchArticle(item.id));
    return { ...item, description };
}

async function fetchArticle(id: DataItem['id']): Promise<Pick<DataItem, 'description'>> {
    const { data } = await ofetch(`${baseUrl}/api/news/detail`, {
        method: 'POST',
        body: { app_type: 'pc', app_type_name: 'PC', id },
    });
    return { description: data.content };
}
