import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/changelog/dev',
    categories: ['program-update'],
    example: '/typora/changelog/dev',
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
            source: ['typora.io/releases/dev'],
            target: '/changelog/dev',
        },
    ],
    name: 'Dev Release Changelog',
    maintainers: ['nczitzk'],
    handler,
    url: 'typora.io/releases/dev',
};

async function handler() {
    const currentUrl = 'https://typora.io/releases/dev';
    const response = await got(currentUrl);

    const $ = load(response.data);

    const occurrences = new Map<string, number>();
    const items = $('h2')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.text();
            const occurrence = (occurrences.get(title) ?? 0) + 1;
            occurrences.set(title, occurrence);
            const sourceLink = $item
                .nextUntil('h2')
                .find('a')
                .filter((_, anchor) => ['detail', "what's new"].includes($(anchor).text().toLowerCase()))
                .first()
                .attr('href');
            const guid = `${currentUrl}#${title}`;
            return {
                title,
                link: sourceLink ? new URL(sourceLink, currentUrl).href : currentUrl,
                guid: occurrence === 1 ? guid : `${guid}:${occurrence}`,
                description: $item
                    .nextUntil('h2')
                    .toArray()
                    .map((item) => $.html(item))
                    .join(''),
            };
        });

    return {
        title: 'Typora Changelog - Dev',
        link: currentUrl,
        description: 'Typora Changelog',
        item: items,
    };
}
