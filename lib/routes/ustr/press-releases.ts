import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/press-releases',
    categories: ['government'],
    example: '/ustr/press-releases',
    name: 'Press Releases',
    maintainers: ['nczitzk'],
    handler,
};
async function handler(ctx: Context) {
    const rootUrl = 'https://ustr.gov';
    const currentUrl = `${rootUrl}/about-us/policy-offices/press-office/press-releases`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const limit = getRouteLimit(ctx, 15);
    const list = $('.view-content .views-row, ul.listing > li')
        .toArray()
        .slice(0, limit)
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('.views-field-title a, a').first();
            const date =
                $item.find('time').attr('datetime') ??
                copyContent($item, $)
                    .children()
                    .remove()
                    .end()
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)?.[0];
            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                pubDate: parsePublicationDate(date),
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const { description } = await cache.tryGet<Pick<DataItem, 'description'>>(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                return { description: content('.field--name-body').html() ?? undefined };
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );
    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
function parsePublicationDate(value?: string) {
    if (!value) {
        return;
    }
    const day = /^(\d{4}-\d{2}-\d{2})(?:$|T)/.exec(value)?.[1];
    if (!day || Number.isNaN(parseDate(day, 'YYYY-MM-DD', true).getTime())) {
        return;
    }
    const date = parseDate(value);
    if (!Number.isNaN(date.getTime())) {
        // A calendar date represents a day, without a source publication time.
        return value === day ? timezone(date, 0) : date;
    }
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
