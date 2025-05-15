import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import xxhash from 'xxhash-wasm';
import sanitizeHtml from 'sanitize-html';

const link = 'https://www.economist.com/the-world-in-brief';

export const route: Route = {
    path: '/espresso',
    categories: ['traditional-media', 'popular'],
    view: ViewType.Articles,
    example: '/economist/espresso',
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
            source: ['economist.com/the-world-in-brief', 'economist.com/espresso'],
        },
    ],
    name: 'Espresso',
    maintainers: ['TonyRL'],
    handler,
    url: 'economist.com/the-world-in-brief',
};

async function handler() {
    const { h64ToString } = await xxhash();
    const nextData = await cache.tryGet(
        link,
        async () => {
            const response = await ofetch(link);
            const $ = cheerio.load(response);
            return JSON.parse($('script#__NEXT_DATA__').text());
        },
        config.cache.routeExpire,
        false
    );

    const { content, metadata } = nextData.props.pageProps;
    const items = content.gobbets.map((item) => ({
        link,
        title: sanitizeHtml(item, { allowedTags: [], allowedAttributes: {} }),
        pubDate: parseDate(content.datePublished),
        description: item,
        guid: `${link}#${h64ToString(item)}`,
    }));

    return {
        title: metadata.title,
        link,
        description: metadata.description,
        language: 'en-gb',
        image: metadata.imageUrl,
        item: items,
    };
}
