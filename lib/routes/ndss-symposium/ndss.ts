import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const url = 'https://www.ndss-symposium.org';

export const route: Route = {
    path: '/ndss',
    categories: ['journal'],
    example: '/ndss-symposium/ndss',
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
            source: ['ndss-symposium.org/'],
        },
    ],
    name: 'Accepted papers',
    maintainers: ['ZeddYu'],
    handler,
    url: 'ndss-symposium.org/',
    description: 'Accepted papers from the latest symposium and workshop pages.',
};

async function handler() {
    // use wordpress api to get data
    const { data } = await got(`${url}/wp-json/wp/v2/pages?slug=accepted-papers`);

    const items = await Promise.all(
        data.map(async (elem) => {
            const $ = load(elem.content.rendered);
            const link = elem.link;
            const pubDate = elem.date_gmt ? parseDate(`${elem.date_gmt}Z`) : parseDate(elem.date);

            const modernPapers = $('.pt-cv-content-item')
                .toArray()
                .map((item): DataItem | undefined => {
                    const $item = $(item);
                    const $title = $item.find('.pt-cv-title a');
                    const href = $title.attr('href');
                    if (!href) {
                        return;
                    }
                    return {
                        title: $title.text(),
                        link: new URL(href, link).href,
                        author: $item.find('.pt-cv-ctf-display_authors .pt-cv-ctf-value').text().trim(),
                        pubDate,
                    };
                })
                .filter((item): item is DataItem => item !== undefined);
            if (modernPapers.length > 0) {
                return modernPapers;
            }

            const divMatch = $('div h3')
                .toArray()
                .map((item): DataItem => {
                    const $item = $(item);
                    const title = $item.text();
                    return {
                        title,
                        author: $item.siblings().text().trim().replaceAll('\n', '').replaceAll(/\s+/g, ' '),
                        link: $item.siblings('a').attr('href'),
                        pubDate,
                    };
                });
            if (divMatch.length > 0) {
                const items = await Promise.all(
                    divMatch.map((item) => {
                        if (item.link) {
                            return cache.tryGet(item.link, async () => {
                                // some titles and authos are not complete
                                const response = await got(item.link);
                                const $ = load(response.body);
                                const $paper = $('.paper-data');
                                const $authors = $paper
                                    .find('p')
                                    .filter((_, element) => $(element).find('strong').text().trim().length > 0)
                                    .first();
                                item.author = $authors.text().trim();
                                $authors.remove();
                                item.description = $paper.html();
                                item.title = $('h1.entry-title').text();
                                return item;
                            });
                        }
                        item.link = `${link}#${item.title?.trim()}`;
                        return item;
                    })
                );
                return items;
            }
            const pMatch = $('p strong')
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    const title = $item.text();
                    return {
                        title,
                        author: $item
                            .parent()
                            .contents()
                            .filter((_, e) => e.nodeType === 3)
                            .text()
                            .trim()
                            .replaceAll('\n', '')
                            .replaceAll(/\s+/g, ' '),
                        link: `${link}#${$item.text().trim()}`,
                        pubDate,
                    };
                });
            return pMatch;
        })
    );

    return {
        title: 'NDSS',
        link: url,
        description: 'The Network and Distributed System Security (NDSS) Symposium Accpeted Papers',
        item: items.flat(),
    };
}
