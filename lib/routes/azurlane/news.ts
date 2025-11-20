import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type Mapping = Record<string, string>;

const JP: Mapping = {
    '0': 'すべて',
    '1': 'お知らせ',
    '2': 'イベント',
    '3': 'メインテナンス',
    '4': '重要',
};

const mkTable = (mapping: Mapping): string => {
    const heading: string[] = [];
    const separator: string[] = [];
    const body: string[] = [];

    for (const key in mapping) {
        heading.push(mapping[key]);
        separator.push(':--:');
        body.push(key);
    }

    return [heading.join(' | '), separator.join(' | '), body.join(' | ')].map((s) => `| ${s} |`).join('\n');
};

const handler: Route['handler'] = async (ctx) => {
    const { server } = ctx.req.param();

    switch (server.toUpperCase()) {
        case 'JP':
            return await ja(ctx);
        default:
            throw new Error('Unsupported server');
    }
};

const ja: Route['handler'] = async (ctx) => {
    const { type = '0' } = ctx.req.param();

    const response = await ofetch<{ data: { rows: { id: number; content: string; title: string; publishTime: number }[] } }>('https://www.azurlane.jp/api/news/list', {
        query: {
            type,
            index: 1,
            size: 15,
        },
    });

    const list = response.data?.rows || [];
    const items = list.map((item) => ({
        title: item.title,
        description: item.content,
        link: `https://www.azurlane.jp/news/${item.id}`,
        pubDate: parseDate(item.publishTime),
    }));

    return {
        title: `アズールレーン - ${JP[type]}`,
        link: 'https://www.azurlane.jp/news',
        language: 'ja-JP',
        image: 'https://play-lh.googleusercontent.com/9QTLYD2_Jd6OIKHwRHkEBnFAgPmVKJwf2xmHjzPk-5w0SRLZumsCoQZGlO8d_kB3Gdld=w480-h960-rw',
        icon: 'https://play-lh.googleusercontent.com/9QTLYD2_Jd6OIKHwRHkEBnFAgPmVKJwf2xmHjzPk-5w0SRLZumsCoQZGlO8d_kB3Gdld=w480-h960-rw',
        logo: 'https://play-lh.googleusercontent.com/9QTLYD2_Jd6OIKHwRHkEBnFAgPmVKJwf2xmHjzPk-5w0SRLZumsCoQZGlO8d_kB3Gdld=w480-h960-rw',
        item: items,
    };
};

export const route: Route = {
    path: '/news/:server/:type?',
    name: 'News',
    categories: ['game'],
    maintainers: ['AnitsuriW'],
    example: '/azurlane/news/jp/0',
    parameters: {
        server: 'game server (ISO 3166 two-letter country code, case-insensitive), only `JP` is supported for now',
        type: 'news type, see the table below, `0` by default',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
    description: mkTable(JP),
};
