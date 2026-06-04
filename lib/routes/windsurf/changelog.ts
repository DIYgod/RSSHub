import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const baseUrl = 'https://windsurf.com';
    const targetUrl: string = new URL('changelog', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    const title: string = $('title').first().text();
    const author: string | undefined = title.split(/\|/).pop()?.trim();

    const items: DataItem[] = $('div[aria-label="changelog-layout"]')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el).parent();

            const version: string | undefined = $el.find('header div').first().text()?.trim();
            const h1: string | undefined = $el.find('article h1').text()?.trim();

            const title: string = [version, h1].filter(Boolean).join(' ');
            const description: string | undefined = $el.find('article div').first()?.html() ?? undefined;
            const pubDateStr: string | undefined = $el.find('header div').last().text()?.trim();
            const guid: string = version ? `windsurf-${version}` : '';
            const image: string | undefined = $el.find('article img').attr('src');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: targetUrl,
                author,
                doi: $el.find('meta[name="citation_doi"]').attr('content'),
                guid,
                id: guid,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    return {
        title,
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author,
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/changelog',
    name: 'Changelog',
    url: 'windsurf.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/windsurf/changelog',
    parameters: undefined,
    description: undefined,
    categories: ['programming'],
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
            source: ['windsurf.com/changelog'],
            target: '/changelog',
        },
    ],
    view: ViewType.Articles,
};
