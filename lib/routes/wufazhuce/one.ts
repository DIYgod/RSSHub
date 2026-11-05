import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const apiUrl = 'https://wufazhuce.com/';
const NAME = '「ONE · 一个」';
export const route: Route = {
    path: '/one',
    categories: ['new-media'],
    example: '/wufazhuce/one',
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
            source: ['wufazhuce.com'],
            target: '/one',
        },
    ],
    name: '首页更新',
    maintainers: ['fengkx', 'sicheng1806'],
    handler,
};
function extractMainContent($: CheerioAPI) {
    if ($('.one-imagen').length) {
        return $('.one-imagen').html();
    }
    if ($('.articulo-contenido').length) {
        return $('.articulo-principal, .articulo-contenido')
            .toArray()
            .map((node) => $.html(node))
            .join('');
    }
    const contents = $('.cuestion-contenido');
    const title = $('.one-cuestion h4').first().text();
    const body = contents.first().text().trim() === title.trim() ? contents.slice(1) : contents;
    return body
        .toArray()
        .map((node) => $.html(node))
        .join('');
}
function parsePhotoDate($: CheerioAPI) {
    const day = $('.one-pubdate .dom').text().trim();
    const month = $('.one-pubdate .may').text().trim();
    if (!/^(?:[1-9]|[12]\d|3[01])$/.test(day) || !/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/.test(month)) {
        return;
    }
    const date = timezone(parseDate(`${day} ${month}`, 'D MMM YYYY', true), 8);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
async function handler(): Promise<Data> {
    const resp = await got(apiUrl);
    const $ = load(resp.body);
    let items: DataItem[] = [
        ...$('#carousel-one div.item')
            .toArray()
            .map((item) => {
                const a = $(item).find('.fp-one-cita a');
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    description: '',
                    category: '摄影',
                };
            }),
        ...$('.fp-one-articulo a')
            .toArray()
            .map((item) => {
                const a = $(item);
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    description: '',
                    category: '文章',
                };
            }),
        ...$('.fp-one-cuestion a')
            .toArray()
            .map((item) => {
                const a = $(item);
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    description: '',
                    category: '问题',
                };
            }),
    ];
    // Fetch and cache the complete item content.
    items = await pMap(
        items,
        async (item: DataItem) => ({
            ...item,
            ...(await cache.tryGet(item.link!, async () => {
                const rsp = await got(item.link);
                const content = load(rsp.body);
                const category = content('.one-imagen-leyenda').text().trim();
                return {
                    ...(category && { category }),
                    description: extractMainContent(content),
                    pubDate: parsePhotoDate(content),
                    author:
                        content('.articulo-autor')
                            .text()
                            .replace(/^\s*作者\s*\//, '')
                            .trim() || undefined,
                };
            })),
        }),
        { concurrency: 3 }
    );
    // Build the feed.
    return {
        title: NAME,
        link: apiUrl,
        item: items,
        description: '复杂世界里, 一个就够了. One is all.',
    };
}
