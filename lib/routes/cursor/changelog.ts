import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const baseUrl = 'https://cursor.com';
    const targetUrl: string = new URL('changelog', baseUrl).href;

    const response = await ofetch(targetUrl, {
        headers: {
            cookie: 'NEXT_LOCALE=en',
        },
    });
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    const items: DataItem[] = $('main')
        .first()
        .find('article')
        .slice(0, limit)
        .toArray()
        .map((el): DataItem => {
            const $el: Cheerio<Element> = $(el);

            const timeEl = $el.find('time').first();
            const pubDateStr = timeEl.attr('datetime') || timeEl.text().trim();
            const versionLabel = timeEl.closest('a').find('.label').text().trim();

            const linkEl = $el.find('h1 a').first();
            const titleText = linkEl.length ? linkEl.text().trim() : $el.find('h1').first().text().trim();
            const title: string = versionLabel ? `[${versionLabel}] ${titleText}` : titleText;

            const linkUrl: string | undefined = linkEl.attr('href');
            let guid = linkUrl ? linkUrl.split('/').pop() : 'unknown';
            if (versionLabel) {
                guid = `cursor-changelog-${versionLabel}`;
            }

            const description: string = $el.find('.prose').html() || '';

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: description,
                },
                language,
            };

            return processedItem;
        });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        language,
    };
};

export const route: Route = {
    path: '/changelog',
    name: 'Changelog',
    url: 'cursor.com',
    maintainers: ['p3psi-boo', 'nczitzk'],
    handler,
    example: '/cursor/changelog',
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
            source: ['cursor.com/changelog'],
            target: '/changelog',
        },
    ],
    view: ViewType.Articles,
};
