import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { baseUrl } from './utils';

const sourceUrl = `${baseUrl}/news/all-news`;
const feedUrl = `${baseUrl}/rss/news_current.xml`;

export const route: Route = {
    path: '/all-news',
    categories: ['journal'],
    example: '/science/all-news',
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
            source: ['science.org/news/all-news', 'science.org/rss/news_current.xml'],
            target: '/all-news',
        },
    ],
    name: 'All News',
    maintainers: ['maxlixiang'],
    handler,
    url: sourceUrl,
    description: 'Latest news from Science Magazine.',
};

async function handler() {
    const response = await got(feedUrl, {
        headers: {
            'user-agent': 'Mozilla/5.0',
        },
    });

    const $ = load(response.data, { xmlMode: true });

    const items = $('item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('title').text().trim();
            const link = $item.find('link').text().trim();
            const description = $item.find('description').text().trim();
            const image = $item.find(String.raw`enc\:enclosure`).attr('rdf:resource');

            return {
                title,
                link,
                guid: $item.attr('rdf:about') || link,
                author: $item.find(String.raw`dc\:creator`).text().trim(),
                pubDate: parseDate($item.find(String.raw`dc\:date`).text().trim()),
                description: image ? `<img src="${image}" referrerpolicy="no-referrer"><br>${description}` : description,
            };
        });

    return {
        title: 'Latest News from Science Magazine',
        description: 'Latest news from Science Magazine.',
        link: sourceUrl,
        image: `${baseUrl}/apple-touch-icon.png`,
        language: 'en-US',
        item: items,
    };
}
