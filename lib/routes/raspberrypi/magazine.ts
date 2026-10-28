import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 12;
    const baseUrl = 'https://magazine.raspberrypi.com';
    const targetUrl = new URL('issues', baseUrl).href;
    const response = await ofetch(targetUrl);
    const $ = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;
    const author = $('meta[property="og:site_name"]').attr('content');

    const items = $('main a[href]')
        .toArray()
        .filter((element) => /^\/issues\/\d+$/.test($(element).attr('href') ?? ''))
        .filter((element, index, elements) => elements.findIndex((previous) => $(previous).attr('href') === $(element).attr('href')) === index)
        .slice(0, limit)
        .flatMap((element): DataItem | DataItem[] => {
            const image = $(element).find('img');
            const title = image.attr('alt');
            if (!title) {
                return [];
            }
            return {
                title,
                link: new URL($(element).attr('href')!, baseUrl).href,
                image: image.attr('src'),
                author,
                language,
            };
        });

    const detailedItems = await pMap(
        items,
        async (item) => {
            const article = await cache.tryGet(`raspberrypi:issue:v5:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const article = $('main > section').first();
                const title = $('meta[property="og:title"]').attr('content') ?? item.title;
                const image = article.find('img').first().attr('src');
                const content = article.find('.markdown');
                const gallery = article.find('a[href*="/storage/representations/"]').parent();
                const description = renderDescription({
                    images: image ? [{ src: image, alt: title ?? undefined }] : undefined,
                    description: (content.html() ?? '') + (content.next('ul').prop('outerHTML') ?? '') + (gallery.html() ?? ''),
                });
                const date = article.find('time').attr('datetime');
                const pdfPath = article.find('a[href$="/pdf"]').attr('href');
                let enclosureUrl: string | undefined;
                if (pdfPath) {
                    const pdfPageUrl = new URL(pdfPath, item.link!).href;
                    const pageSource1 = await ofetch(pdfPageUrl);
                    const pdfPage = load(pageSource1);
                    const downloadPath = pdfPage('main a[href$="/pdf/download"]').attr('href');
                    if (downloadPath) {
                        const downloadPageUrl = new URL(downloadPath, pdfPageUrl).href;
                        const pageSource2 = await ofetch(downloadPageUrl);
                        const downloadPage = load(pageSource2);
                        enclosureUrl = downloadPage('main a[href$=".pdf"]').attr('href');
                    }
                }
                return {
                    title,
                    description,
                    pubDate: date ? parseDate(date) : undefined,
                    content: { html: description },
                    image,
                    banner: image,
                    enclosure_url: enclosureUrl,
                    enclosure_type: enclosureUrl ? 'application/pdf' : undefined,
                };
            });
            return { ...item, ...article };
        },
        { concurrency: 3 }
    );

    return {
        title: $('meta[property="og:site_name"]').attr('content') ?? $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: detailedItems,
        image: $('meta[property="og:image"]').attr('content'),
        author,
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/magazine',
    name: 'Official Magazine',
    url: 'magazine.raspberrypi.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/raspberrypi/magazine',
    parameters: undefined,
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
            source: ['magazine.raspberrypi.com'],
            target: '/magazine',
        },
    ],
    view: ViewType.Articles,
};
