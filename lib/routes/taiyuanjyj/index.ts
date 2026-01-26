import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://jyj.taiyuan.gov.cn';

const channelMap = {
    zkzs: {
        name: '中考招生',
        path: '/zkzs.html',
    },
    jykx: {
        name: '教育快讯',
        path: '/jykx.html',
    },
    tzgg: {
        name: '通知公告',
        path: '/tzgg.html',
    },
} as const;

type Channel = keyof typeof channelMap;

export const route: Route = {
    path: '/:channel?',
    categories: ['government'],
    example: '/taiyuanjyj/zkzs',
    parameters: {
        channel: {
            description: '栏目，默认为 `zkzs`',
            options: [
                {
                    label: '中考招生',
                    value: 'zkzs',
                },
                {
                    label: '教育快讯',
                    value: 'jykx',
                },
                {
                    label: '通知公告',
                    value: 'tzgg',
                },
            ],
        },
    },
    radar: [
        {
            source: ['jyj.taiyuan.gov.cn/zkzs.html'],
            target: '/zkzs',
        },
        {
            source: ['jyj.taiyuan.gov.cn/jykx.html'],
            target: '/jykx',
        },
        {
            source: ['jyj.taiyuan.gov.cn/tzgg.html', 'jyj.taiyuan.gov.cn/tzgg_4.html'],
            target: '/tzgg',
        },
    ],
    name: '栏目',
    maintainers: ['tdcasual'],
    handler,
    url: 'jyj.taiyuan.gov.cn/',
    description: `| 中考招生 | 教育快讯 | 通知公告 |
| -------- | -------- | -------- |
| zkzs     | jykx     | tzgg     |`,
};

function resolveUrl(url: string | undefined, base: string): string | undefined {
    if (!url) {
        return;
    }

    try {
        return new URL(url, base).href;
    } catch {
        return url;
    }
}

function makeLinksAbsolute($: CheerioAPI, element: Cheerio<Element>, base: string) {
    element.find('a[href]').each((_, a) => {
        const href = $(a).attr('href');
        const resolvedHref = resolveUrl(href, base);
        if (resolvedHref) {
            $(a).attr('href', resolvedHref);
        }
    });

    element.find('img[src]').each((_, img) => {
        const src = $(img).attr('src');
        const resolvedSrc = resolveUrl(src, base);
        if (resolvedSrc) {
            $(img).attr('src', resolvedSrc);
        }
    });
}

async function fetchItem(item: DataItem, referer: string): Promise<DataItem> {
    if (!item.link) {
        return item;
    }

    return cache.tryGet(item.link, async () => {
        const { data: response } = await got(item.link as string, {
            headers: {
                Referer: referer,
                'User-Agent': config.trueUA,
            },
            timeout: config.requestTimeout,
        });

        const $ = load(response);

        const title = $('.mainCont h1').first().text().trim();
        if (title) {
            item.title = title;
        }

        const info = $('.mainCont .explain').first();
        const pubDateText = info.find('em').first().text().trim();
        if (pubDateText) {
            item.pubDate = timezone(parseDate(pubDateText, 'YYYY-MM-DD'), +8);
        }

        const author = info.find('span').first().text().trim();
        item.author = author || item.author;

        const content = $('#Zoom').first().length ? $('#Zoom').first() : $('#zoom').first();
        if (content.length) {
            content.find('script').remove();
            content.find('style').remove();
            makeLinksAbsolute($, content, rootUrl);
            item.description = content.html() ?? item.description;
        }

        return item;
    });
}

async function handler(ctx) {
    const channel = (ctx.req.param('channel') ?? 'zkzs') as Channel;
    const channelInfo = channelMap[channel];
    if (!channelInfo) {
        throw new InvalidParameterError('Unknown channel');
    }

    const limitFromQuery = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const limit = Number.isFinite(limitFromQuery) && limitFromQuery > 0 ? limitFromQuery : 30;

    const currentUrl = new URL(channelInfo.path, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
        timeout: config.requestTimeout,
    });

    const $ = load(response);

    const items = $('.RightSide_con ul.List_list li')
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const item = $(element);
            const a = item.find('a').first();
            const link = resolveUrl(a.attr('href'), rootUrl);
            if (!link) {
                return null;
            }

            const pubDateText = item.find('span.fr').first().text().trim();

            return {
                title: a.attr('title') || a.text().trim(),
                link,
                pubDate: pubDateText ? timezone(parseDate(pubDateText, 'YYYY-MM-DD'), +8) : undefined,
            };
        })
        .filter((item): item is DataItem => Boolean(item));

    const fullItems = await pMap(items, (item) => fetchItem(item, currentUrl), { concurrency: 2 });

    return {
        title: `太原市教育局 - ${channelInfo.name}`,
        link: currentUrl,
        item: fullItems,
    };
}
