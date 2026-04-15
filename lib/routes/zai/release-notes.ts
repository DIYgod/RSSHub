import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const targetUrl = 'https://docs.z.ai/release-notes/new-released';

export const route: Route = {
    path: '/release-notes',
    categories: ['program-update'],
    example: '/zai/release-notes',
    name: 'Release Notes',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['docs.z.ai/release-notes/new-released'],
            target: '/release-notes',
        },
    ],
    url: 'docs.z.ai/release-notes/new-released',
};

async function handler() {
    const item = await cache.tryGet(targetUrl, async () => {
        const response = await ofetch(targetUrl);
        const $ = load(response);
        const article = $('#content-area').first();

        return article
            .find('h2[id]')
            .toArray()
            .map((heading) => {
                const $heading = $(heading);
                const title = $heading.text().trim();
                const anchor = $heading.attr('id') ?? title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');
                const description = $heading
                    .nextUntil('h2[id]')
                    .toArray()
                    .map((element) => $(element).prop('outerHTML'))
                    .join('');

                return {
                    title,
                    description,
                    link: `${targetUrl}#${anchor}`,
                    pubDate: parseDate(title),
                    guid: `zai-release-notes-${anchor}`,
                } satisfies DataItem;
            });
    });

    return {
        title: 'Z.ai Release Notes',
        description: 'Release notes from Z.ai developer docs',
        link: targetUrl,
        item,
    };
}
