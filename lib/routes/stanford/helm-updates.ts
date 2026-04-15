import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://crfm.stanford.edu';
const targetUrl = `${baseUrl}/blog`;

export const route: Route = {
    path: '/helm/updates',
    categories: ['blog'],
    example: '/stanford/helm/updates',
    name: 'HELM Updates',
    maintainers: ['dvorak0'],
    handler,
    radar: [
        {
            source: ['crfm.stanford.edu/blog'],
            target: '/helm/updates',
        },
    ],
    url: 'crfm.stanford.edu/blog',
};

async function handler() {
    const { data: response } = await got(targetUrl);
    const $ = load(response);

    const list: DataItem[] = $('a[href*="/202"]')
        .toArray()
        .map((element) => {
            const $element = $(element);
            const href = $element.attr('href') ?? '';
            const title = $element.text().trim().replaceAll(/\s+/g, ' ');
            const match = href.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
            return {
                title,
                link: new URL(href, baseUrl).href,
                pubDate: match ? parseDate(`${match[1]}-${match[2]}-${match[3]}`) : undefined,
            };
        })
        .filter((item, index, items) => /helm/i.test(item.title) && item.link && items.findIndex((other) => other.link === item.link) === index)
        .slice(0, 20);

    const item = await pMap(
        list,
        (entry) =>
            cache.tryGet(entry.link!, async () => {
                const { data: detail } = await got(entry.link!);
                const $$ = load(detail);
                const content = $$('.blog-p').first();
                entry.title = content.find('h1').first().text().trim() || entry.title;
                entry.description = content.html() ?? undefined;
                return entry;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Stanford CRFM HELM Updates',
        description: 'HELM-related updates from Stanford CRFM',
        link: targetUrl,
        item,
    };
}
