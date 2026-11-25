import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://claude.dev';

export const route: Route = {
    path: '/dev/blog',
    categories: ['programming'],
    example: '/claude/dev/blog',
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
            source: ['claude.dev/', 'claude.dev/blog/'],
            target: '/dev/blog',
        },
    ],
    name: 'Developer Blog',
    maintainers: ['rmaced0'],
    handler,
    url: 'claude.dev',
    description: 'Full-text articles from claude.dev, the blog where Anthropic developers write about building with Claude and Claude Code.',
};

async function handler(ctx: Context): Promise<Data> {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const feed = await parser.parseString(await ofetch(`${baseUrl}/rss.xml`, { responseType: 'text' }));

    const list: DataItem[] = feed.items.slice(0, limit).map((item) => ({
        title: item.title ?? '',
        link: item.link,
        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
        author: item.creator,
        category: item.categories,
        description: item.content,
    }));

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('.prose');
                // Drop interactive UI, the mobile copy of each diagram and inactive tab panels
                content.find('style, button, [role="tablist"], [role="tabpanel"][hidden], .art-diagram-narrow').remove();
                // Figure labels are separated from captions by CSS only
                content.find('figcaption > b:first-child').after(' · ');

                item.description = content.html() || item.description;

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: feed.title ?? 'claude.dev Blog',
        link: `${baseUrl}/`,
        description: feed.description,
        language: 'en',
        item: items,
    };
}
