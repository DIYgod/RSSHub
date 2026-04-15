import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const articleUrl = 'https://help.openai.com/en/articles/9624314-model-release-notes';

export const route: Route = {
    path: '/model-release-notes',
    categories: ['program-update'],
    example: '/openai/model-release-notes',
    name: 'Model Release Notes',
    maintainers: ['xbot'],
    handler,
    radar: [
        {
            source: ['help.openai.com/en/articles/9624314-model-release-notes'],
            target: '/model-release-notes',
        },
    ],
    url: 'help.openai.com/en/articles/9624314-model-release-notes',
};

async function handler() {
    const item = await cache.tryGet(articleUrl, async () => {
        const response = await ofetch(articleUrl, {
            headers: {
                'User-Agent': config.ua,
            },
        });
        const $ = load(response);
        const articleContent = $('.article-content');

        const items = articleContent
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
                const match = title.match(/\(([^)]+)\)$/);
                const pubDate = match ? parseDate(match[1]) : undefined;

                return {
                    title,
                    description,
                    pubDate,
                    link: articleUrl,
                    guid: `openai-model-release-notes-${title}`,
                } satisfies DataItem;
            });

        return {
            title: $('h1').first().text().trim(),
            description: $('meta[name="description"]').attr('content') ?? 'Model release notes from OpenAI',
            items,
        };
    });

    return {
        title: item.title,
        description: item.description,
        link: articleUrl,
        item: item.items,
    };
}
