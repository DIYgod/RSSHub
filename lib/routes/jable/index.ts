import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    name: 'Jable 搜索结果',
    maintainers: [],
    handler,
};

const GOT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://jable.tv/',
};

// function renderDescription(item) {
//     return `
//         <a href="${item.link}">
//             <img src="${item.thumb}" style="max-width:100%" />
//         </a>
//         <p>
//             ${item.duration ? `<strong>Duration:</strong> ${item.duration}` : ''}
//             ${item.views ? `｜<strong>Views:</strong> ${item.views}` : ''}
//             ${item.favorites ? `｜<strong>Favorites:</strong> ${item.favorites}` : ''}
//             ${item.author ? `｜<strong>Author:</strong> ${item.author}` : ''}
//         </p>
//     `.trim();
// }

async function handler(ctx) {
    const { query } = ctx.req.param();
    const encodedQuery = encodeURIComponent(query);

    const apiUrl = `https://jable.tv/search/${encodedQuery}/` + `?mode=async&function=get_block&block_id=list_videos_videos_list_search_result` + `&q=${encodedQuery}&sort_by=post_date`;

    const response = await got(apiUrl, { headers: GOT_HEADERS });
    const $ = load(response.data);

    const pageAuthor = $('section.content-header h2').first().text().trim() || query;

    const items = await Promise.all(
        $('.video-img-box')
            .toArray()
            .map((el) => {
                const $el = $(el);

                const $titleLink = $el.find('.detail h6.title a');
                const title = $titleLink.text().trim();
                const link = $titleLink.attr('href') ?? '';

                const thumb = $el.find('img[data-src]').attr('data-src') ?? '';
                const preview = $el.find('img[data-preview]').attr('data-preview') ?? '';

                // const duration = $el.find('.label').text().trim();
                // const subText = $el.find('.sub-title').text().trim();
                // const nums = subText.split(/\s+/);
                // const views = nums[0] ?? '';
                // const favorites = nums[1] ?? '';

                const videoId = $el.find('[data-fav-video-id]').attr('data-fav-video-id') ?? link;

                return cache.tryGet(`jable:video:${videoId}`, async () => {
                    let pubDate;
                    const author = pageAuthor;
                    let videoUrl;

                    try {
                        const { data } = await got(link, { headers: GOT_HEADERS });
                        const $page = load(data);

                        const dateText = $page('.video-date').text().trim();
                        if (dateText) {
                            pubDate = parseDate(dateText);
                        }

                        const script = $page('script')
                            .toArray()
                            .map((s) => $(s).html())
                            .find((s) => s && s.includes('sources'));

                        if (script) {
                            const match = script.match(/file:\s*"([^"]+)"/);
                            if (match) {
                                videoUrl = match[1];
                            }
                        }
                    } catch {
                        // 忽略错误
                    }

                    return {
                        title,
                        link,
                        guid: `jable:video:${videoId}`,
                        pubDate,
                        author,
                        // description: renderDescription({
                        //     title,
                        //     link,
                        //     thumb,
                        //     duration,
                        //     views,
                        //     favorites,
                        //     author,
                        // }),
                        media: {
                            content: preview
                                ? {
                                      url: preview,
                                      type: 'video/mp4',
                                  }
                                : videoUrl
                                  ? {
                                        url: videoUrl,
                                        type: 'video/mp4',
                                    }
                                  : undefined,
                            thumbnail: {
                                url: thumb,
                            },
                        },
                    };
                });
            })
    );

    return {
        title: query,
        link: `https://jable.tv/search/${encodedQuery}/`,
        description: `Search results for ${query}`,
        item: items,
    };
}
