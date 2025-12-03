import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://anytxt.net';
    const targetUrl: string = new URL('download/', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en-US';

    const image: string | undefined = $('meta[property="og:image"]').attr('content');

    const items: DataItem[] = $('p.has-medium-font-size')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.text();
            const description: string | undefined = $el.next().html() ?? '';
            const pubDateStr: string | undefined = title.split(/\s/)[0];
            const linkUrl: string | undefined = targetUrl;
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
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
        })
        .filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/release-notes',
    name: 'Release Notes',
    url: 'anytxt.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/anytxt/release-notes',
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
            source: ['anytxt.net'],
            target: '/anytxt/release-notes',
        },
    ],
    view: ViewType.Articles,
};
