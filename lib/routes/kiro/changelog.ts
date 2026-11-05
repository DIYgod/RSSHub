import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';
import Parser from 'rss-parser';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const parser = new Parser();
const parseCalendarDate = (value: string): Date | undefined => {
    const date = parseDate(value.trim(), ['MMM D, YYYY', 'MMMM D, YYYY'], 'en', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
};

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 30);

    const baseUrl = 'https://kiro.dev';
    const targetUrl: string = new URL('changelog/', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;
    const publicationDates = new Map<string, Date>();
    const feedLink = $('link[rel="alternate"][type="application/rss+xml"]').attr('href');
    if (feedLink) {
        const feed = await parser.parseString(await ofetch(new URL(feedLink, baseUrl).href, { responseType: 'text' }));
        for (const entry of feed.items) {
            if (!(entry.link && entry.isoDate)) {
                continue;
            }

            const date = parseDate(entry.isoDate);
            if (Number.isFinite(date.getTime())) {
                publicationDates.set(new URL(entry.link, baseUrl).href.replace(/\/$/, ''), date);
            }
        }
    }

    let items: DataItem[] = $('a.block')
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const title = `${$el.parent().find('span').text()} ${$el.find('h3').text()}`;
            const description = $el.parent().parent().find('div.prose').html();
            const pubDateStr: string | undefined = $el.parent().parent().parent().find('time').text();
            const linkUrl: string | undefined = $el.attr('href');

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseCalendarDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                content: {
                    html: description,
                    text: $el.parent().parent().find('div.prose').text(),
                },
                language,
            };

            return processedItem;
        });

    items = items.map((item) => ({ ...item, pubDate: (item.link ? publicationDates.get(item.link.replace(/\/$/, '')) : undefined) ?? item.pubDate }));
    const sourceOrder = ctx.req.query('sorted') === 'false';
    const hasDates = items.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()));
    if (!sourceOrder && hasDates) {
        items = items.toSorted((a, b) => Number(b.pubDate) - Number(a.pubDate));
    }
    items = items.slice(0, sourceOrder || hasDates ? limit : Math.max(30, limit));

    items = await pMap(
        items,
        async (item) => {
            if (!item.link) {
                return item;
            }

            const detail = await cache.tryGet(`kiro:detail:${item.link}`, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title = `${$$('article span').first().text()} ${$$('article h1').text()}`;
                const description = $$('div.prose').html();
                const pubDateStr: string | undefined = $$('time').text();
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseCalendarDate(pubDateStr) : undefined,
                    content: {
                        html: description,
                        text: $$('div.prose').text(),
                    },
                    image,
                    banner: image,
                };

                return processedItem;
            });
            return { ...item, ...detail, pubDate: detail.pubDate ?? item.pubDate, language };
        },
        { concurrency: 3 }
    );

    items = items.map((item) => ({ ...item, pubDate: (item.link ? publicationDates.get(item.link.replace(/\/$/, '')) : undefined) ?? item.pubDate }));

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/changelog',
    name: 'Changelog',
    url: 'kiro.dev',
    maintainers: ['nczitzk'],
    handler,
    example: '/kiro/changelog',
    parameters: undefined,
    description: undefined,
    categories: ['program-update'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['kiro.dev', 'kiro.dev/changelog/'],
            target: '/changelog',
        },
    ],
    view: ViewType.Articles,
};
