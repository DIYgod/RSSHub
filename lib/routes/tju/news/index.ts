import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const newsBaseUrl = 'http://news.tju.edu.cn/';
const getArticle = async (link: string) => {
    try {
        const response = await got(link);
        const $ = load(response.data);
        const dateText =
            $('.arc-info time').first().text().trim() ||
            $('.contentTime')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/)?.[0];
        const streamLines = $('.v_news_content script').toArray();
        for (const element of streamLines) {
            const match = $(element)
                .text()
                .match(/showVsbVideo\(\s*("(?:\\.|[^"\\])*")/);
            if (!match) {
                continue;
            }
            const videoUrl = new URL(JSON.parse(match[1]), link);
            if (isOneOf(videoUrl.protocol, ['http:', 'https:'])) {
                $(element).replaceWith($('<video controls></video>').attr('src', videoUrl.href));
            }
        }
        return {
            pubDate: dateText ? timezone(parseDate(dateText, ['YYYY/MM/DD', 'YYYY-MM-DD']), 8) : undefined,
            author:
                $('.arc-info')
                    .text()
                    .match(/作者：([\s\S]*?)编辑：/)?.[1]
                    .trim() || undefined,
            description: $('.v_news_content').html() ?? undefined,
        };
    } catch {
        // Keep the source listing when an article detail is unavailable.
        return {};
    }
};
const pageType = (href) => {
    if (href === undefined) {
        return 'unknown';
    }
    if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    return url.hostname === 'news.tju.edu.cn' ? 'tju-news' : 'unknown';
};
export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/tju/news/focus',
    parameters: { type: 'default `focus`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['AlanZeng423', 'SuperPung'],
    handler,
    description: `| Focus on TJU | General News | Internal News | Media Report | Pictures of TJU |
| :----------: | :----------: | :-----------: | :----------: | :-------------: |
|     focus    |    general   |    internal   |     media    |     picture     |`,
};
async function handler(ctx) {
    const type = ctx.req.param('type');
    let path, subtitle;
    switch (type) {
        case 'focus':
            subtitle = '聚焦天大';
            path = 'jjtd.htm';
            break;
        case 'general':
            subtitle = '综合新闻';
            path = 'xw/zhxw.htm';
            break;
        case 'internal':
            subtitle = '校内新闻';
            path = 'xnxw1/qb.htm';
            break;
        case 'media':
            subtitle = '媒体报道';
            path = 'mtjj.htm';
            break;
        case 'picture':
            subtitle = '图说天大';
            path = 'yx/tstd.htm';
            break;
        default:
            subtitle = '聚焦天大';
            path = 'jjtd.htm';
    }
    const listUrl = new URL(path, newsBaseUrl).href;
    const response = await got(listUrl, {
        headers: {
            Referer: newsBaseUrl,
        },
    });
    const $ = load(response.data);
    let elements = $('.nylist-a > li, .nylist-b > li, .nylist-c > li').toArray();
    if (!elements.length) {
        elements = type === 'picture' ? $('.picList > li').toArray() : $('.indexList > li').toArray();
    }
    const list = elements.map(
        (
            item
        ): DataItem & {
            type?: string;
        } => {
            const $item = $(item);
            const anchor = $item.find('h4 > a').first().length ? $item.find('h4 > a').first() : $item.find('a').first();
            const href = anchor.attr('href');
            const type = pageType(href);
            return {
                title: anchor.find('h4').first().length ? anchor.find('h4').first().text() : anchor.text(),
                link: type === 'in-site' ? new URL(href!, listUrl).href : href,
                type,
            };
        }
    );
    const items = await pMap(
        list,
        async (item) => {
            switch (item.type) {
                case 'tju-news':
                case 'in-site': {
                    const listing = omitInternalField(item, 'type');
                    return { ...listing, ...(await cache.tryGet(`tju:news:article:v3:${item.link}`, () => getArticle(item.link!))) };
                }
                default:
                    return item;
            }
        },
        { concurrency: 3 }
    );
    return {
        title: '天津大学新闻网 - ' + subtitle,
        link: listUrl,
        item: items,
    };
}
function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
function omitInternalField<T extends object, K extends keyof T>(item: T, key: K): Omit<T, K> {
    const metadata = { ...item };
    delete metadata[key];
    return metadata;
}
