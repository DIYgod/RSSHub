import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://www.design.zjut.edu.cn';
const apiUrl = `${rootUrl}/jsp/api/an`;

const map = new Map([
    [1, { id: '16', title: '学院新闻 - 浙工大设建学院' }],
    [2, { id: '18', title: '公告通知 - 浙工大设建学院' }],
    [3, { id: '25', title: '科研申报 - 浙工大设建学院' }],
    [4, { id: '26', title: '科研成果 - 浙工大设建学院' }],
    [5, { id: '27', title: '文件与资源 - 浙工大设建学院' }],
    [6, { id: '20', title: '学术交流 - 浙工大设建学院' }],
]);

type Article = {
    id: string;
    title: string;
    content?: string | null;
    date?: string;
    url?: string | null;
};

export const route: Route = {
    path: '/da/:type',
    categories: ['university'],
    example: '/zjut/da/1',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '设计与建筑学院',
    maintainers: ['yikZero'],
    url: 'www.design.zjut.edu.cn',
    handler,
    description: `| 学院新闻 | 公告通知 | 科研申报 | 科研成果 | 文件与资源 | 学术交流 |
| -------- | -------- | -------- | -------- | ---------- | -------- |
| 1        | 2        | 3        | 4        | 5          | 6        |`,
};

async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));
    const category = map.get(type);
    if (!category) {
        throw new InvalidParameterError(`Invalid type: ${type}`);
    }

    const listResponse = await got(`${apiUrl}/column`, {
        searchParams: {
            id: category.id,
        },
    });

    const list = listResponse.data.data.pages.list as Article[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.url?.trim() || `${apiUrl}/news?id=${item.id}`, async (): Promise<DataItem> => {
                const link = item.url?.trim() || `${apiUrl}/news?id=${item.id}`;
                if (item.url?.trim()) {
                    return {
                        title: item.title,
                        description: item.content ? makeAbsolute(item.content) : `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`,
                        pubDate: item.date ? parseDate(item.date) : undefined,
                        link,
                    };
                }

                const detailResponse = await got(`${apiUrl}/news`, {
                    searchParams: {
                        id: item.id,
                    },
                });
                const detail = detailResponse.data.data as Article;

                return {
                    title: detail.title,
                    description: makeAbsolute(detail.content ?? item.content ?? ''),
                    pubDate: detail.date ? parseDate(detail.date) : undefined,
                    link,
                };
            })
        )
    );

    return {
        title: category.title,
        link: rootUrl,
        item: items,
    };
}

function makeAbsolute(html: string) {
    return html.replaceAll(/(href|src)="(upload\/[^"]+)"/g, (_, attr: string, url: string) => `${attr}="${rootUrl}/${url}"`);
}
