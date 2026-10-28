import { load } from 'cheerio';
import type { Context } from 'hono';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/soft/news/:type?',
    categories: ['university'],
    example: '/zzu/soft/news/xyxw',
    parameters: { type: '可选，默认为 `xyxw`' },
    name: '计算机与人工智能学院（软件学院）',
    maintainers: ['nia3y'],
    handler,
    description: `| 参数名称 | 学院动态 | 通知公告 |
| -------- | -------- | -------- |
| 参数     | xyxw     | tzgg     |`,
};
const baseUrl = 'https://www7.zzu.edu.cn/csai/';
const config = {
    xyxw: {
        title: '学院动态',
        url: `${baseUrl}xydt.htm`,
    },
    tzgg: {
        title: '通知公告',
        url: `${baseUrl}tzgg.htm`,
    },
};
class ArticleUnavailableError extends Error {
    constructor(public author?: string) {
        super('Article content is unavailable');
    }
}
function parsePublishedDate(value?: string) {
    if (!value) {
        return;
    }
    const match = value.match(/^\s*(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s|T|$)/);
    if (!match) {
        return;
    }
    const calendarDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    if (!Number.isFinite(parseDate(calendarDate, 'YYYY-MM-DD', true).getTime())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
async function handler(ctx: Context) {
    const { type = 'xyxw' } = ctx.req.param();
    const { title, url } = config[type];
    const response = await ofetch(url);
    const $ = load(response);
    const list: Array<
        DataItem & {
            link: string;
        }
    > = $('.list li')
        .toArray()
        .map((v) => {
            const $v = $(v);
            return {
                link: new URL($v.find('a').attr('href')!, url).href,
                title: $v.find('a').text(),
                pubDate: parsePublishedDate($v.find('span').text()),
            };
        });
    const out = await pMap(
        list,
        async (item) => {
            try {
                const details = await cache.tryGet(`zzu:soft:details:v4:${item.link}`, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    const author =
                        $('.con-tit-p span:contains("信息来源：")')
                            .text()
                            .replace(/^\s*信息来源：/, '')
                            .replaceAll(/\s+/g, ' ')
                            .trim() || undefined;
                    const description = $('.v_news_content').html();
                    if (!description?.trim()) {
                        throw new ArticleUnavailableError(author);
                    }
                    return { author, description };
                });
                return { ...item, ...details };
            } catch (error) {
                if (error instanceof ArticleUnavailableError) {
                    return { ...item, author: error.author };
                }
                if (error instanceof FetchError) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );
    return {
        title: `郑州大学计算机与人工智能学院 -- ${title}`,
        link: url,
        item: out,
    };
}
