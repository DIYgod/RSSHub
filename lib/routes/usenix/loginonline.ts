import { type Cheerio, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/loginonline',
    categories: ['journal'],
    example: '/usenix/loginonline',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['usenix.org/publications/loginonline', 'usenix.org/publications', 'usenix.org/'],
        },
    ],
    name: ';login:',
    maintainers: ['wu-yufei'],
    handler,
};
async function handler() {
    const baseUrl = 'https://www.usenix.org';
    const { data: response } = await got(`${baseUrl}/publications/loginonline`);
    const $ = load(response);
    const list = $('div.views-row')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('.views-field-title').text(),
                link: `${baseUrl}${$item.find('a').attr('href')}`,
                pubDate: $item.find('.views-field-field-lv2-publication-date').text().trim() ? timezone(parseDate($item.find('.views-field-field-lv2-publication-date').text().trim(), 'MMMM D, YYYY'), 0) : undefined,
                author: $item.find('.views-field-pseudo-author-list').text().trim().replace('Authors: ', ''),
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author' | 'category'>>(`usenix:loginonline:detail:${item.link}`, async () => {
                const details: Pick<DataItem, 'description' | 'pubDate' | 'author' | 'category'> = {};
                const { data: response } = await got(item.link);
                const $ = load(response);
                const content = $('.group-article-body-wrapper');
                details.category = mapElements(content.find('.field-name-field-lv2-article-type .field-item'), (_, element) => $(element).text());
                content.find('.field-name-field-lv2-publication-date, .field-name-field-lv2-article-type, .field-pseudo-field--author-list, .field-name-field-lv2-shepherds').remove();
                details.description = content.html();
                const published = $('meta[property="article:published_time"]').attr('content');
                if (published) {
                    details.pubDate = parseDate(published);
                }
                return details;
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: 'USENIX ;login:',
        link: `${baseUrl}/publications/loginonline`,
        description: 'An open access publication driven by the USENIX community',
        item: items,
    };
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
