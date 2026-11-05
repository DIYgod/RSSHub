import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import { isValidHost } from '@/utils/valid-host';

interface ChannelNode {
    children?: Record<string, ChannelNode>;
    domain_name: string;
    node: string;
}

function getKeysRecursive(dic: Record<string, ChannelNode>, attr: 'domain_name' | 'node', array: string[]) {
    for (const v of Object.values(dic)) {
        if (v.children === undefined) {
            array.push(v[attr]);
        } else {
            getKeysRecursive(v.children, attr, array);
        }
    }
    return array;
}

export const route: Route = {
    path: '/news/:category?',
    categories: ['traditional-media'],
    example: '/huanqiu/news/china',
    parameters: { category: '类别，可以使用二级域名作为参数，默认为：china' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['huanqiu.com/'],
        },
    ],
    name: '分类',
    maintainers: ['yuxinliu-alex'],
    handler,
    url: 'huanqiu.com/',
    description: `| 国内新闻 | 国际新闻 | 军事 | 台海   | 评论    |
| -------- | -------- | ---- | ------ | ------- |
| china    | world    | mil  | taiwai | opinion |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'china';
    if (!isValidHost(category)) {
        throw new InvalidParameterError('Invalid category');
    }

    const host = `https://${category}.huanqiu.com`;

    const resp = await got({
        method: 'get',
        url: `${host}/api/channel_pc`,
    });

    const name = getKeysRecursive(resp.data.children, 'domain_name', [])[0];

    const nodes = getKeysRecursive(resp.data.children, 'node', [])
        .map((x) => `"${x}"`)
        .join(',');
    const limit = getRouteLimit(ctx, 20);
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(20, limit);
    const req = await got({
        method: 'get',
        url: `${host}/api/list?node=${nodes}&offset=0&limit=${candidateLimit}`,
    });

    const list: Array<DataItem & { link: string }> = req.data.list
        .filter((item) => item.aid)
        .map((item) => ({
            link: `${host}/article/${item.aid}`,
            title: item.title,
        }));

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                const timestamp = content('textarea.article-time').text();
                const pubDate = /^\d+$/.test(timestamp) ? parseDate(Number(timestamp)) : undefined;
                const description = content('textarea.article-content').text();
                if (!description.trim()) {
                    throw new Error(`Huanqiu article content was not found at ${item.link}`);
                }
                return {
                    description,
                    author:
                        content('textarea.article-author')
                            .text()
                            .replace(/^作者[：:]\s*/, '')
                            .trim() || content('span', '.source').text(),
                    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                    category: content('meta[name="keywords"]').attr('content')?.split(','),
                };
            });
            return { ...item, description: detail.description, author: detail.author, pubDate: detail.pubDate, category: detail.category };
        },
        { concurrency: 3 }
    );

    return {
        title: `${name} - 环球网`,
        link: host,
        description: '环球网',
        language: 'zh-CN' as const,
        item: items,
    };
}
