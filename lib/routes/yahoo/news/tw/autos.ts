import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const feedUrl = 'https://autos.yahoo.com.tw/rss/car-news';
const maxRetries = 3;

const parseFeed = (feedContent: string) => {
    const trimmedFeedContent = feedContent.trim();

    const $feed = load(trimmedFeedContent, { xmlMode: true });

    const hasXmlDeclaration = trimmedFeedContent.startsWith('<?xml');
    const hasSupportedRoot = trimmedFeedContent.startsWith('<rss') || trimmedFeedContent.startsWith('<feed') || trimmedFeedContent.startsWith('<channel') || hasXmlDeclaration;

    if (!hasSupportedRoot || ($feed('channel').length === 0 && $feed('feed').length === 0)) {
        throw new Error(`Upstream returned invalid RSS content: ${feedUrl}`);
    }

    return $feed;
};

const fetchFeed = async (attempt = 0) => {
    try {
        const feedResponse = await got(feedUrl, {
            headers: {
                'User-Agent': config.trueUA,
            },
        });
        const feedContent = typeof feedResponse.data === 'string' ? feedResponse.data : String(feedResponse.data);
        return parseFeed(feedContent);
    } catch (error) {
        if (attempt >= maxRetries - 1) {
            throw error;
        }

        return fetchFeed(attempt + 1);
    }
};

export const route: Route = {
    path: '/news/tw/autos',
    categories: ['new-media'],
    example: '/yahoo/news/tw/autos',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Autos News Taiwan',
    maintainers: ['ParinLL'],
    handler: async () => {
        const $feed = await fetchFeed();

        const items = $feed('item')
            .toArray()
            .map((item) => {
                const $item = $feed(item);

                return {
                    title: $item.find('title').text(),
                    link: $item.find('link').text(),
                    description: $item.find('description').text(),
                    pubDate: parseDate($item.find('pubDate').text()),
                };
            });

        return {
            title: $feed('channel > title').first().text(),
            link: $feed('channel > link').first().text(),
            description: $feed('channel > description').first().text(),
            item: items,
            image: $feed('channel > image > url').first().text(),
        };
    },
};
