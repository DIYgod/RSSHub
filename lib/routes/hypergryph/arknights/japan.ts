import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';

type ContentItem = {
    key: string;
    value: string;
    bannerUrl: string;
    bannerUrlMobile: string;
    digest: string;
    imgCount: number;
    imgInfo: any[];
    ext_0: string;
    ext_1: string;
    ext_2: string;
    ext_3: string;
    ext_4: string;
    ext_5: string;
    ext_6: string;
    ext_7: string;
    ext_8: string;
    ext_9: string;
};

type NewsDetail = {
    id: string;
    title: string;
    category: number;
    content: ContentItem[];
    lang: string;
    highlight: number;
    publishedAt: string;
    ext1: null | string;
    ext2: null | string;
};

export const route: Route = {
    path: '/arknights/japan',
    categories: ['game'],
    example: '/hypergryph/arknights/japan',
    radar: [
        {
            source: ['ak.arknights.jp/news', 'ak.arknights.jp/'],
        },
    ],
    name: 'アークナイツ (日服新闻)',
    maintainers: ['ofyark'],
    handler,
    url: 'ak.arknights.jp/news',
};

async function handler(ctx: Context) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 9;

    const response = await ofetch('https://www.arknights.jp:10014/news', {
        query: {
            lang: 'ja',
            limit,
            page: 1,
        },
    });

    const newsList = (response.data.items as NewsDetail[]).map((item) => ({
        title: item.title,
        description: item.content[0].value,
        pubDate: parseDate(item.publishedAt),
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
