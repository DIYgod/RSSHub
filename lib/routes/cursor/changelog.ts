import { type Data, type DataItem, type Route, ViewType } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const baseUrl: string = 'https://www.cursor.com';
    const targetUrl: string = new URL('changelog', baseUrl).href;

    const response = await ofetch(targetUrl, {
        headers: {
            cookie: 'NEXT_LOCALE=en',
        },
    });
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    const items: DataItem[] = $('article.relative')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const version: string = $el.find('div.items-center p').first().text();

            const title: string = `[${version}] ${$el
                .find(String.raw`h2 a.hover\:underline`)
                .contents()
                .first()
                .text()}`;
            const pubDateStr: string | undefined = $el.find('div.inline-flex p').first().text().trim();
            const linkUrl: string | undefined = $el.find(String.raw`h2 a.hover\:underline`).attr('href');
            const guid: string = `cursor-changelog-${version}`;
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
        })
        .filter((_): _ is DataItem => true);

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
    url: 'www.cursor.com',
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
            source: ['www.cursor.com/changelog'],
            target: '/changelog',
        },
    ],
    view: ViewType.Articles,
};
