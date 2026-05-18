import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

// type id => display name
type Mapping = Record<string, string>;

const JP: Mapping = {
    '0': '全て',
    '1': 'イベント',
    '2': 'お知らせ',
    '3': 'メンテナンス',
};

// render into MD table
const mkTable = (mapping: Mapping): string => {
    const heading: string[] = [],
        separator: string[] = [],
        body: string[] = [];

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
            throw [];
    }
};

const ja: Route['handler'] = async (ctx) => {
    const { type = '0' } = ctx.req.param();

    const data = await ofetch<{ data: { rows: Array<{ id: number; content: string; summary: string; publishTime: number }> } }, 'json'>('https://api-web.bluearchive.jp/api/news/list', {
        query: {
            typeId: type,
            pageNum: 16,
            pageIndex: 1,
        },
    });

    return {
        title: `ブルアカ - ${JP[type]}`,
        link: 'https://bluearchive.jp/news/newsJump',
        language: 'ja-JP',
        image: 'https://webcnstatic.yostar.net/ba_cn_web/prod/web/favicon.png', // The CN website has a larger one
        icon: 'https://webcnstatic.yostar.net/ba_cn_web/prod/web/favicon.png',
        logo: 'https://webcnstatic.yostar.net/ba_cn_web/prod/web/favicon.png',
        item: data.data.rows.map((row) => ({
            title: row.summary,
            description: row.content,
            link: `https://bluearchive.jp/news/newsJump/${row.id}`,
            pubDate: parseDate(row.publishTime),
        })),
    };
};

export const route: Route = {
    path: '/news/:server/:type?',
    name: 'News',
    categories: ['game'],
    maintainers: ['equt'],
    example: '/bluearchive/news/jp',
    parameters: {
        server: 'game server (ISO 3166 two-letter country code, case-insensitive), only `JP` is supported for now',
        type: 'news type, checkout the table below for details',
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
    description: [JP].map((el) => mkTable(el)).join('\n\n'),
};
