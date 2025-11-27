import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();

    const baseUrl: string = 'https://community.chocolatey.org';
    const targetUrl: string = new URL(`packages/${id}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    const title: string = $('meta[property="og:title"]').attr('content');
    const description: string | undefined = $('div#description').html();
    const pubDateStr: string | undefined = $('h3.mt-0.mb-3').last().text();
    const categoryEls: Element[] = $('a[data-package-tag]').toArray();
    const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
    const authorEls: Element[] = $('img[alt="gravatar"]').toArray();
    const authors: DataItem['author'] = authorEls.map((authorEl) => {
        const $authorEl: Cheerio<Element> = $(authorEl).parent();

        return {
            name: $authorEl.find('span').text(),
            url: $authorEl.attr('href') ? new URL($authorEl.attr('href') as string, baseUrl).href : undefined,
            avatar: $authorEl.attr('src'),
        };
    });
    const guid: string = `chocolatey-${title}`;
    const image: string | undefined = $('div.package-logo img').attr('src') ? new URL($('div.package-logo img').attr('src') as string, baseUrl).href : undefined;
    const upDatedStr: string | undefined = pubDateStr;

    const processedItem: DataItem = {
        title,
        description,
        pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
        link: targetUrl,
        category: categories,
        author: authors,
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

    const items: DataItem[] = [processedItem];

    return {
        title: $('title').first().text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/packages/:id',
    name: 'Package',
    url: 'community.chocolatey.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/chocolatey/packages/microsoft-edge',
    parameters: {
        id: {
            description: 'Package ID',
        },
    },
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
            source: ['community.chocolatey.org/packages'],
            target: (params) => {
                const id: string = params.id;

                return `/chocolatey/package${id ? `/${id}` : ''}`;
            },
        },
    ],
    view: ViewType.Notifications,

    zh: {
        path: '/packages/:id',
        name: '程序包',
        url: 'community.chocolatey.org',
        maintainers: ['nczitzk'],
        handler,
        example: '/chocolatey/package/microsoft-edge',
        parameters: {
            id: {
                description: '程序包 ID',
            },
        },
        description: undefined,
    },
};
