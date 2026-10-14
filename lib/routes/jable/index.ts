import { load } from 'cheerio';
import { html } from 'hono/html';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/search/:query',
    categories: ['multimedia'],
    example: '/jable/search/みなみ羽琉',
    parameters: {
        query: 'Search keyword',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
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

    const response = await got(apiUrl);
    const $ = load(response.data);

    const seenLinks = new Set<string>();
    const videos: VideoThumb[] = $('.video-img-box')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const $titleLink = $el.find('.detail h6.title a');
            const $img = $el.find('img');
            const href = $titleLink.attr('href');
            if (!href || !URL.canParse(href, baseUrl)) {
                return;
            }
            const link = new URL(href, baseUrl);
            if (!['http:', 'https:'].includes(link.protocol)) {
                return;
            }

            return {
                title: $titleLink.text(),
                link: link.href,
                thumb: $img.attr('data-src') ?? '',
                preview: $img.attr('data-preview') ?? '',
            };
        })
        .filter((video): video is VideoThumb => video !== undefined)
        .filter((video) => {
            if (seenLinks.has(video.link)) {
                return false;
            }
            seenLinks.add(video.link);
            return true;
        });

    const items = videos.map((video) => {
        const preview = video.preview && URL.canParse(video.preview, baseUrl) ? new URL(video.preview, baseUrl) : undefined;
        const mediaUrl = preview && ['http:', 'https:'].includes(preview.protocol) && /\.mp4$/i.test(preview.pathname) ? preview.href : undefined;
        const media: NonNullable<DataItem['media']> = {
            thumbnail: {
                url: video.thumb,
            },
        };
        if (mediaUrl) {
            media.content = {
                url: mediaUrl,
                type: 'video/mp4',
            };
        }
        return {
            title: video.title,
            link: video.link,
            author: query,
            description: renderDescription(video),
            media,
        };
    });

    return {
        title: `${query} - Search | Jable`,
        link: baseUrl,
        description: `Search results for ${query}`,
        item: items,
    };
}
