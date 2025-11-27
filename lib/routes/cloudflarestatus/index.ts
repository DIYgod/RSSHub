import path from 'node:path';

import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const baseUrl: string = 'https://www.cloudflarestatus.com';

    const response = await ofetch(baseUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    $('div.incidents-list').remove();

    const items: DataItem[] = $('div.update')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const $actualTitleEl: Cheerio<Element> = $el.parent().parent().find('a');
            const actualTitle: string = $actualTitleEl.text();
            const type: string = $el.find('strong').first().text();
            const text: string = $el.find('span.whitespace-pre-wrap').first().text();

            const title: string = `${type ? `${type} - ` : ''}${text}`;
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                actualTitle,
                description: $el.html(),
            });
            const pubDateStr: string | undefined = $el.find('span.ago').attr('data-datetime-unix');
            const linkUrl: string | undefined = $actualTitleEl.attr('href') ? new URL($actualTitleEl.attr('href') as string, baseUrl).toString() : undefined;
            const categories: string[] = [type].filter(Boolean);
            const guid: string = linkUrl ? `${linkUrl}#${pubDateStr}` : '';
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr, 'x') : undefined,
                link: linkUrl,
                category: categories,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: description,
                },
                updated: upDatedStr ? parseDate(upDatedStr, 'x') : undefined,
                language,
            };

            return processedItem;
        });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: baseUrl,
        item: items,
        allowEmpty: true,
        language,
        id: baseUrl,
    };
};

export const route: Route = {
    path: '/',
    name: 'Status',
    url: 'www.cloudflarestatus.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/cloudflarestatus',
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
            source: ['www.cloudflarestatus.com'],
            target: '/',
        },
    ],
    view: ViewType.Notifications,
};
