import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jiaowu/news/:type?',
    categories: ['university'],
    example: '/dlpu/jiaowu/news/2',
    parameters: { type: '默认为 `2`' },
    name: '教务处新闻',
    maintainers: ['xu42'],
    handler,
    description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| 2        | 3        |`,
};

const baseUrl = 'https://jwc.dlpu.edu.cn';
const pageId = '439771';
const articleRootPattern = /el:\s*"#(?:graphic|text)-detail-vue"/;

const map = {
    2: {
        title: '新闻资讯',
        appId: '2215611',
        engineInstanceId: '3033675',
        typeId: '7219415',
    },
    3: {
        title: '通知公告',
        appId: '2215609',
        engineInstanceId: '3033673',
        typeId: '6484827',
    },
};

async function handler(ctx: Context) {
    const { type = '2' } = ctx.req.param();
    if (!Object.hasOwn(map, type)) {
        throw new InvalidParameterError('Unsupported category. Use 2 for news or 3 for notices.');
    }
    const { title, appId, engineInstanceId, typeId } = map[type];
    const link = `${baseUrl}/engine2/m/0/${appId}/${engineInstanceId}?p=${pageId}`;
    const headers = { Referer: `${baseUrl}/` };
    const page = await ofetch<string>(link, { headers });
    const sign = page.match(/\bvar sign\s*=\s*"([^"]+)"/)?.[1];
    if (!sign) {
        throw new Error('The official category page did not provide its API signature.');
    }
    const limit = String(getRouteLimit(ctx, 10));

    const response = await ofetch(`${baseUrl}/engine2/general/${appId}/type/more-datas`, {
        method: 'POST',
        headers,
        body: new URLSearchParams({
            engineInstanceId,
            sign,
            pageNum: '1',
            pageSize: limit,
            typeId,
            topTypeId: '',
            sw: '',
            typeDataSort: '-1',
        }),
    });

    if (response.code !== 1 || !Array.isArray(response.data?.datas?.datas)) {
        throw new Error(`The official news API rejected the request: ${response.message || response.description || 'missing article list'}`);
    }

    const list: DataItem[] = response.data.datas.datas.map((item) => ({
        link: `${baseUrl}/engine2/d/${item.id}/${engineInstanceId}/0/${appId}?t=${typeId}&p=${pageId}`,
        title: item.title,
        pubDate: timezone(parseDate(item.publishTime), 8),
    }));
    if (ctx.req.query('sorted') !== 'false') {
        list.sort((a, b) => new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime());
    }
    const items = await pMap(
        list.slice(0, getRouteLimit(ctx, 10)),
        (item) =>
            cache.tryGet(item.link!, async () => {
                const articlePage = await ofetch<string>(item.link!, { headers });
                const $ = load(articlePage);
                const script = $('script')
                    .toArray()
                    .map((element) => $(element).text())
                    .find((text) => articleRootPattern.test(text));
                const data = script?.slice(script.search(articleRootPattern)).match(/\bdata:\s*(\{[^\r\n]+\}),\r?\n/)?.[1];
                if (!data) {
                    throw new Error('The official article page did not provide its content data.');
                }
                const article = JSON.parse(data);
                if (typeof article.content !== 'string') {
                    throw new TypeError('The official article data did not provide its main content.');
                }
                return { ...item, description: article.content };
            }),
        { concurrency: 3 }
    );

    return {
        link,
        title: `大连工业大学教务处 - ${title}`,
        language: 'zh-CN' as const,
        item: items,
    };
}
