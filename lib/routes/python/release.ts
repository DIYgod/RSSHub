import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document, type Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import { type Data, type DataItem, type Language, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const requestedLimit = Number(ctx.req.query('limit'));
    // oxlint-disable-next-line unicorn-js/prefer-number-is-safe-integer -- Preserve the existing positive-integer limit acceptance range and default.
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 30;

    const baseUrl = 'https://www.python.org';
    const targetUrl: string = new URL('downloads', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = $('div.active-release-list-widget ol.list-row-container li')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('span.release-version').text();
            const pubDateStr: string | undefined = $el
                .find('span.release-start')
                .text()
                ?.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
            const linkUrl: string | undefined = $el.find('span.release-pep a').attr('href');

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                language,
            };

            return processedItem;
        });

    items = await pMap(
        items,
        async (item) => {
            const link = item.link;
            if (!link) {
                return item;
            }

            const details = await cache.tryGet(`${link}:python-pep-body`, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1.page-title').text();
                const body = copyNodes($$('section#pep-content'));
                const author = body
                    .find('dl.rfc2822 dt')
                    .filter((_, element) => $$(element).text() === 'Author:')
                    .next('dd')
                    .text();
                body.children('h1.page-title, dl.rfc2822, section#contents').remove();
                const description: string | undefined = body.html() ?? undefined;
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');

                const processedItem: DataItem = {
                    title,
                    description,
                    author: author || undefined,
                    content: {
                        html: description,
                        text: body.text(),
                    },
                    image,
                    banner: image,
                };

                return processedItem;
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: $('div.active-release-list-widget h2.widget-title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/release',
    name: 'Active Releases',
    url: 'www.python.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/python/release',
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
            source: ['www.python.org', 'www.python.org/downloads'],
            target: '/release',
        },
    ],
    view: ViewType.Articles,
};

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
