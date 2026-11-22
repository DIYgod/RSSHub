import { load } from 'cheerio';
import { html } from 'hono/html';

import type { Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';

export const route: Route = {
    path: '/search/:query',
    categories: ['multimedia'],
    example: '/jable/search/みなみ羽琉',
    parameters: {
        query: 'Search keyword',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['jable.tv/search/:query'],
            target: '/search/:query',
        },
    ],
    name: '搜索结果',
    maintainers: ['eve2ptp'],
    handler,
};

interface VideoThumb {
    title: string;
    link: string;
    thumb: string;
    preview: string;
}

function renderDescription(video: VideoThumb): string {
    return html`<img src="${video.thumb}" alt="${video.title}" style="max-width:100%" />`.toString();
}

async function fetchSearch(apiUrl: string): Promise<string> {
    const { page, destroy } = await getPlaywrightPage(apiUrl, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        await page.goto(apiUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.video-img-box', { state: 'attached' });
        return await page.content();
    } finally {
        await destroy();
    }
}

async function handler(ctx) {
    const { query } = ctx.req.param();

    const params = new URLSearchParams({
        mode: 'async',
        function: 'get_block',
        block_id: 'list_videos_videos_list_search_result',
        q: query,
        sort_by: 'post_date',
    });

    const encodedQuery = encodeURIComponent(query);
    const baseUrl = `https://jable.tv/search/${encodedQuery}/`;
    const apiUrl = `${baseUrl}?${params.toString()}`;

    const response = await fetchSearch(apiUrl);
    const $ = load(response);

    const videos: VideoThumb[] = $('.video-img-box')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const $titleLink = $el.find('.detail h6.title a');
            const $img = $el.find('img');

            return {
                title: $titleLink.text(),
                link: $titleLink.attr('href') ?? '',
                thumb: $img.attr('data-src') ?? '',
                preview: $img.attr('data-preview') ?? '',
            };
        });

    const items = videos.map((video) => ({
        title: video.title,
        link: video.link,
        author: query,
        description: renderDescription(video),
        media: {
            thumbnail: {
                url: video.thumb,
            },
            content: {
                url: video.preview,
                type: 'video/mp4',
            },
        },
    }));

    return {
        title: `${query} - Search | Jable`,
        link: baseUrl,
        description: `Search results for ${query}`,
        item: items,
    };
}
