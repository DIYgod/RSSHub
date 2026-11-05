import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

type NewsDetail = {
    id: number;
    title: string;
    type: string;
    content: string;
    publishTime: number;
};

export const route: Route = {
    path: '/arknights/japan',
    categories: ['game'],
    example: '/hypergryph/arknights/japan',
    radar: [
        {
            source: ['www.arknights.jp/news', 'www.arknights.jp/'],
        },
    ],
    name: 'アークナイツ (日服新闻)',
    maintainers: ['ofyark'],
    handler,
    url: 'www.arknights.jp/news',
};

const parsePublicationDate = (value: number) => {
    const date = Number.isFinite(value) && value > 0 ? parseDate(value) : undefined;
    return date && Number.isFinite(date.getTime()) ? date : undefined;
};

async function handler(ctx: Context): Promise<Data> {
    const limit = getRouteLimit(ctx, 9);

    const response = await ofetch<{ data: { rows: NewsDetail[] } }>('https://www.arknights.jp/api/resource/news/list', {
        query: {
            index: 1,
            size: limit,
            type: 'latest',
        },
    });

    const newsList = response.data.rows.map((item) => ({
        title: item.title,
        description: item.content,
        pubDate: parsePublicationDate(item.publishTime),
        link: `https://www.arknights.jp/news/${item.id}`,
    }));

    return {
        title: 'アークナイツ',
        link: 'https://www.arknights.jp/news',
        description: 'アークナイツ ニュース',
        language: 'ja',
        item: newsList,
    };
}
