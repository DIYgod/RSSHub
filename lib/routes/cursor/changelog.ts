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

    const baseUrl: string = 'https://cursor.com';
    const targetUrl: string = new URL('changelog', baseUrl).href;

    const response = await ofetch(targetUrl, {
        headers: {
            cookie: 'NEXT_LOCALE=en',
        },
    });
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    const items: DataItem[] = $('article.relative')
        .slice(0, limit)
        .toArray()
        .map((el): DataItem => {
            const $el: Cheerio<Element> = $(el);

            let version: string = '';
            let pubDateStr: string | undefined;

            $el.find('div').each((_, div) => {
                const text = $(div).text().trim();
                const dateVersionMatch = text.match(/^(\w+\s+\d{1,2},\s+\d{4})(\d+\.\d+)$/);
                if (dateVersionMatch) {
                    pubDateStr = dateVersionMatch[1];
                    version = dateVersionMatch[2];
                    return false; // Stop after finding first match
                }
            });

            const linkEl = $el.find('a[href^="/changelog/"]').first();
            const titleText = linkEl.length ? linkEl.text().trim() : $el.find('h2').first().text().trim();

            const title: string = version ? `[${version}] ${titleText}` : titleText;

            const linkUrl: string | undefined = linkEl.attr('href');
            const guid: string = `cursor-changelog-${version || 'unknown'}`;
            const upDatedStr: string | undefined = pubDateStr;

            const $h2El = $el.find('h2').first();

            if ($h2El.length) {
                $h2El.prevAll().remove();
                $h2El.remove();
            }

            const description: string = $el.html() || '';

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
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
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
