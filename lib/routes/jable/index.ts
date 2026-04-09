import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
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
    name: 'Jable 搜索结果',
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
    return `<img src="${video.thumb}" alt="${video.title}" style="max-width:100%" />`.trim();
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

    const videos: VideoThumb[] = $('.video-img-box')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const $titleLink = $el.find('.detail h6.title a');
            const $img = $el.find('img');

            return {
                title: $titleLink.text().trim(),
                link: $titleLink.attr('href') ?? '',
                thumb: $img.attr('data-src') ?? '',
                preview: $img.attr('data-preview') ?? '',
            };
        });

    const items = await Promise.all(
        videos.map((video) =>
            cache.tryGet(`jable:search:${video.link}`, () => ({
                title: video.title,
                link: video.link,
                author: query,
                description: renderDescription(video),
                media: {
                    content: {
                        url: video.preview || video.link,
                        type: 'video/mp4',
                    },
                    thumbnail: {
                        url: video.thumb,
                    },
                },
            }))
        )
    );

    return {
        title: `${query} - Search | Jable`,
        link: baseUrl,
        description: `Search results for ${query}`,
        item: items,
    };
}
