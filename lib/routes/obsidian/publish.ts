import { Route, DataItem } from '@/types';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';
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
    name: 'Obsidian Publish',
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
    const $ = load(response, { scriptingEnabled: false });
    let preloadCacheUrl = '';
    for (const script of $('script').toArray()) {
        const scriptContent = $(script).html();
        const preloadCacheUrlMatch = scriptContent?.match(/window\.preloadCache\s*=\s*f\("([^"]+)"\);/);
        if (preloadCacheUrlMatch) {
            preloadCacheUrl = preloadCacheUrlMatch[1];
            break;
        }
    }

    let preloadCacheResponse;
    try {
        preloadCacheResponse = await ofetch(preloadCacheUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                Referer: 'https://publish.obsidian.md/',
                Origin: 'https://publish.obsidian.m/',
            },
        });
    } catch {
        preloadCacheResponse = {};
    }

    const items: DataItem[] = [];
    for (const postKey in preloadCacheResponse) {
        const post = preloadCacheResponse[postKey];
        if (!post) {
            continue;
        }
        const item = post?.frontmatter || {};
        if (!('title' in item)) {
            item.title = getTitle(postKey);
        }
        items.push(item);
    }
    return items;
}
