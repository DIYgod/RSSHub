import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/daily',
    categories: ['new-media'],
    example: '/bandcamp/daily',
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
            source: ['daily.bandcamp.com/latest'],
            target: '/daily',
        },
    ],
    name: 'Daily',
    maintainers: ['ashi-koki'],
    handler,
    url: 'daily.bandcamp.com/latest',
    description: 'The latest Bandcamp Daily articles, with the full article text and images.',
};

async function handler(ctx) {
    const rootUrl = 'https://daily.bandcamp.com';
    const limit = getRouteLimit(ctx, 10);

    const feedText = await ofetch(`${rootUrl}/feed`);
    const feed = await parser.parseString(feedText);

    const items = await pMap(
        feed.items.slice(0, limit),
        (item) =>
            cache.tryGet(item.link!, async () => {
                const articleText = await ofetch(item.link!);
                const $ = load(articleText);
                const $article = $('article').first();
                const image = load(item.content ?? '')('img').attr('src') ?? $('meta[property="og:image"]').attr('content');
                const author = $article.find('article-credits a').first().text() || item.creator;

                $article
                    .find(
                        'article-type, article-title, article-credits, article-playbutton, article-end, article-footer, .bamplayer-art, mplayer-artist, .player-wrapper, .mplayer-sidebar, aotd-ornament, img#feature-image, script, style'
                    )
                    .remove();

                return {
                    title: item.title!,
                    link: item.link,
                    pubDate: item.isoDate ? parseDate(item.isoDate) : undefined,
                    author: author || undefined,
                    category: item.categories,
                    image,
                    description: (image ? `<img src="${image}">` : '') + ($article.html() ?? ''),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: feed.title!,
        link: `${rootUrl}/latest`,
        description: feed.description,
        item: items,
    };
}
