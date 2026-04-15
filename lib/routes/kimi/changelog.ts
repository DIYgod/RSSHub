import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const targetUrl = 'https://platform.kimi.ai/blog/posts/changelog';

export const route: Route = {
    path: '/changelog',
    categories: ['program-update'],
    example: '/kimi/changelog',
    name: 'Changelog',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['platform.kimi.ai/blog/posts/changelog'],
            target: '/changelog',
        },
    ],
    url: 'platform.kimi.ai/blog/posts/changelog',
};

async function handler() {
    const item = await cache.tryGet(targetUrl, async () => {
        const response = await ofetch(targetUrl);
        const $ = load(response);
        const article = $('article').first();

        return article
            .find('h2')
            .toArray()
            .map((heading) => {
                const $heading = $(heading);
                const title = $heading.text().trim();
                const description = $heading
                    .nextUntil('h2')
                    .toArray()
                    .map((element) => $(element).prop('outerHTML'))
                    .join('');
                const anchor = title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');

                return {
                    title,
                    description,
                    pubDate: parseDate(title),
                    link: `${targetUrl}#${anchor}`,
                    guid: `kimi-changelog-${anchor}`,
                } satisfies DataItem;
            })
            .filter((entry) => entry.title);
    });

    return {
        title: 'Kimi Open Platform Changelog',
        description: 'New feature release log for the Kimi Open Platform',
        link: targetUrl,
        item,
    };
}
