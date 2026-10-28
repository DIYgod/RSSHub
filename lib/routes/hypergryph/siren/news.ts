import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/siren/news',
    categories: ['game'],
    example: '/hypergryph/siren/news',
    radar: [
        {
            source: ['monster-siren.hypergryph.com/info'],
        },
    ],
    name: '塞壬唱片',
    maintainers: ['rikkablue'],
    handler,
    url: 'monster-siren.hypergryph.com/info',
};

const parsePublicationDate = (value: string) => {
    const date = typeof value === 'string' ? parseDate(value, 'YYYY-MM-DD', true) : undefined;
    return date && Number.isFinite(date.getTime()) ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) : undefined;
};

async function handler() {
    const response = await ofetch('https://monster-siren.hypergryph.com/api/news', {
        headers: {
            Referer: 'https://monster-siren.hypergryph.com/info',
        },
    });

    const data = response.data.list;

    return {
        title: '塞壬唱片新闻',
        link: 'https://monster-siren.hypergryph.com/info/',
        description: '塞壬唱片新闻',
        item: data.map((item) => ({
            title: item.title,
            pubDate: parsePublicationDate(item.date),
            link: `https://monster-siren.hypergryph.com/info/${item.cid}`,
        })),
    };
}
