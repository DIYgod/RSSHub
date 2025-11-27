import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getTitle } from './utils';

export const route: Route = {
    path: '/publish/:id',
    categories: ['blog'],
    example: '/obsidian/publish/marshallontheroad',
    parameters: { id: '网站 id，由Publish持有者自定义' },
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
            source: ['publish.obsidian.md/'],
        },
    ],
    name: 'Publish',
    maintainers: ['Xy2002'],
    handler,
    url: 'publish.obsidian.md/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const items = await fetchPage(id);

    return {
        title: 'Obsidian Publish',
        language: 'en-us',
        item: items,
        link: 'https://publish.obsidian.md/',
    };
}

async function fetchPage(id: string) {
    const baseUrl = `https://publish.obsidian.md/${id}`;
    const response = await ofetch(baseUrl);
    const $ = load(response);
    const preloadCacheUrl =
        $('script:contains("preloadCache")')
            .text()
            .match(/preloadCache\s*=\s*f\("([^"]+)"\);/)?.[1] || '';

    let preloadCacheResponse: Record<string, { frontmatter?: Record<string, string> }>;
    try {
        preloadCacheResponse = await ofetch(preloadCacheUrl, {
            headers: {
                'User-Agent': config.trueUA,
                Referer: 'https://publish.obsidian.md/',
                Origin: 'https://publish.obsidian.m/',
            },
        });
    } catch {
        preloadCacheResponse = {};
    }

    const items: DataItem[] = Object.entries(preloadCacheResponse)
        .map(([postKey, post]) => {
            if (!post) {
                return null;
            }
            const item: DataItem = {
                title: post.frontmatter?.title || getTitle(postKey),
                link: `${baseUrl}/${postKey.replaceAll(' ', '+').split('.md')[0]}`,
                pubDate: post.frontmatter?.['date created'] ? parseDate(post.frontmatter['date created']) : undefined,
                ...post.frontmatter,
            };

            return item;
        })
        .filter(Boolean) as DataItem[];

    return items;
}
