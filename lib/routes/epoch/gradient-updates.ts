import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

const feedUrl = 'https://epochai.substack.com/feed';
const targetUrl = 'https://epoch.ai/gradient-updates';

export const route: Route = {
    path: '/gradient-updates',
    categories: ['blog'],
    example: '/epoch/gradient-updates',
    name: 'Gradient Updates',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['epoch.ai/gradient-updates'],
            target: '/gradient-updates',
        },
    ],
    url: 'epoch.ai/gradient-updates',
};

async function handler() {
    const feed = await parser.parseURL(feedUrl);
    const item = await Promise.all(
        (feed.items ?? []).slice(0, 20).map((entry) =>
            cache.tryGet(entry.link!, async () => {
                const response = await ofetch(entry.link!);
                const $ = load(response);
                entry.description = $('.body.markup').html() ?? $('.post-content').html() ?? entry.content ?? undefined;
                return entry;
            })
        )
    );

    return {
        title: 'Epoch AI Gradient Updates',
        description: 'Gradient Updates from Epoch AI',
        link: targetUrl,
        item,
    };
}
