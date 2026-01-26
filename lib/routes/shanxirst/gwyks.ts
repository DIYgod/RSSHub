import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';

import { fetchHtml, fetchItem, parseListDate, resolveUrl, rootUrl } from './utils';

const topicMap = {
    '2026gwyks': '2026年公务员考试专题',
    '2026xdsks': '2026年选调生考试专题',
    '2025gwy': '2025年公务员考试专题',
    '2025xds': '2025年选调生考试专题',
} as const;

type Topic = keyof typeof topicMap;

export const route: Route = {
    path: '/gwyks/:topic?',
    categories: ['government'],
    example: '/shanxirst/gwyks/2026gwyks',
    parameters: {
        topic: {
            description: '专题目录，默认为 `2026gwyks`',
            options: [
                {
                    label: '2026年公务员考试专题',
                    value: '2026gwyks',
                },
                {
                    label: '2026年选调生考试专题',
                    value: '2026xdsks',
                },
                {
                    label: '2025年公务员考试专题',
                    value: '2025gwy',
                },
                {
                    label: '2025年选调生考试专题',
                    value: '2025xds',
                },
            ],
        },
    },
    radar: [
        {
            source: ['rst.shanxi.gov.cn/rsks/gwyks/:topic/'],
            target: '/gwyks/:topic',
        },
    ],
    name: '公务员考试专题',
    maintainers: ['tdcasual'],
    handler,
    url: 'rst.shanxi.gov.cn/rsks/gwyks/2026gwyks/',
    description: '山西省人力资源和社会保障厅「人事考试」- 公务员考试专题公告（仅抓取列表第一页）。',
};

async function handler(ctx) {
    const topic = (ctx.req.param('topic') ?? '2026gwyks') as Topic;
    const topicName = topicMap[topic];
    if (!topicName) {
        throw new InvalidParameterError(`Invalid topic, supported: ${Object.keys(topicMap).join(', ')}`);
    }

    const limitFromQuery = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const limit = Number.isFinite(limitFromQuery) && limitFromQuery > 0 ? limitFromQuery : 30;

    const listUrl = new URL(`/rsks/gwyks/${topic}/`, rootUrl).href;
    const response = await fetchHtml(listUrl);
    const $ = load(response);

    const pageTitle = $('.ztzl_dt_title mark').first().text().trim() || topicName;

    const items = $('.ztzl_dt_content ul.second_right_ul li')
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const li = $(element);
            const a = li.find('a[href]').first();
            const link = resolveUrl(a.attr('href'), listUrl);
            if (!link) {
                return null;
            }

            return {
                title: a.attr('title') || a.text().trim(),
                link,
                pubDate: parseListDate(li.find('span.pull-right').first().text()),
            };
        })
        .filter((item): item is DataItem => Boolean(item));

    const fullItems = await pMap(items, (item) => fetchItem(item, listUrl), { concurrency: 2 });

    return {
        title: `山西人事考试 - ${pageTitle}`,
        link: listUrl,
        item: fullItems,
    };
}
