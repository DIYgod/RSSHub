import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const columns: Array<{ value: string; label: string }> = [
    { value: '0', label: '全部' },
    { value: '1', label: '孟岩专栏' },
    { value: '2', label: '知行黑板报' },
    { value: '3', label: '知行读书会' },
    { value: '4', label: '知行小酒馆' },
    { value: '5', label: '保险专栏' },
    { value: '6', label: '知行头条' },
    { value: '7', label: '精选文章' },
    { value: '8', label: '一周新知' },
    { value: '9', label: '一周好想法' },
    { value: '10', label: '无人知晓' },
    { value: '11', label: '你好同路人' },
    { value: '13', label: '知行周报' },
    { value: '14', label: '有理有据' },
    { value: '15', label: 'Ta 的投资故事' },
    { value: '16', label: '投资 ABC' },
    { value: '17', label: '海外投资Blog' },
    { value: '18', label: '中国大类资产投资年报' },
    { value: '19', label: '夸下海口' },
];

const columnNames: Record<string, string> = Object.fromEntries(columns.map(({ value, label }) => [value, label]));

function resolveLink(href: string | undefined, baseUrl: string) {
    if (!href) {
        return;
    }

    try {
        const url = new URL(href, baseUrl);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            return url.href;
        }
    } catch {
        return;
    }
}

function parsePublicationDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }

    const date = parseDate(value.trim(), ['YYYY-MM-DD', 'YYYY年M月D日'], true);
    if (Number.isFinite(date.getTime())) {
        return timezone(date, 8);
    }
}

export const route: Route = {
    path: '/materials/:id?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/youzhiyouxing/materials',
    parameters: {
        id: {
            description: '分类',
            options: columns,
            default: '0',
        },
    },
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
            source: ['youzhiyouxing.cn/materials'],
            target: '/materials',
        },
    ],
    name: '有知文章',
    maintainers: ['broven', 'Fatpandac', 'nczitzk'],
    handler,
    url: 'youzhiyouxing.cn/materials',
    description: ['| 编号 | 栏目 |', '| :--: | :--- |', ...columns.map(({ value, label }) => `| ${value} | ${label} |`)].join('\n'),
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://youzhiyouxing.cn';
    const currentUrl = `${rootUrl}/materials?column_id=${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.article-card[id^="material-"]')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.find('h3').text(),
                link: resolveLink($item.find('a.article-link').attr('href') ?? $item.attr('href'), currentUrl),
                category: $item
                    .find('.article-column')
                    .toArray()
                    .map((column) => $(column).text().trim())
                    .filter(Boolean),
                pubDate: parsePublicationDate($item.find('.article-meta time').text()),
            };
        })
        .filter((item) => item.link);

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`youzhiyouxing:article:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('#zx-material-marker-root img[data-src]').each((_, image) => {
                    const $image = content(image);
                    $image.attr('src', $image.attr('data-src')!).removeAttr('data-src');
                });

                return {
                    description: content('#zx-material-marker-root').html()!,
                    author: content('meta[property="article:author"]').attr('content') || undefined,
                    pubDate: parsePublicationDate(content('meta[property="article:published_time"]').attr('content')),
                };
            });

            return { ...item, ...detail, pubDate: detail.pubDate ?? item.pubDate };
        },
        { concurrency: 3, stopOnError: false }
    );

    const columnId = id === '' ? '0' : id;
    const columnName = $(`button[phx-value-column_id="${columnId}"]`).text() || columnNames[columnId];

    return {
        title: `有知有行 - ${columnName}`,
        link: currentUrl,
        item: items,
    };
}
