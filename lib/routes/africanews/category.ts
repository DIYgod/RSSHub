import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://www.africanews.com';
const sections: Record<string, { title: string; path: string; theme?: string }> = {
    news: { title: 'News', path: '/news/', theme: 'news' },
    business: { title: 'Business', path: '/business/', theme: 'business' },
    markets: { title: 'Markets', path: '/business/markets/' },
    'science-technology': { title: 'Science & Technology', path: '/science-technology/', theme: 'science_technology' },
};

export const route: Route = {
    path: '/category/:section',
    categories: ['traditional-media'],
    example: '/africanews/category/news',
    parameters: {
        section: {
            description: 'Section ID',
            options: Object.entries(sections).map(([value, section]) => ({ value, label: section.title })),
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['kargonerd'],
    handler,
};

async function handler(ctx) {
    const sectionId = ctx.req.param('section');
    const section = sections[sectionId];
    if (!section) {
        throw new InvalidParameterError(`Unsupported Africanews section: ${sectionId}`);
    }
    const limit = Math.min(Number.parseInt(ctx.req.query('limit') || '50'), 100);
    const items = section.theme ? await fetchFeed(section, limit) : await fetchListing(section, limit);
    return {
        title: `Africanews - ${section.title}`,
        link: new URL(section.path, rootUrl).href,
        language: 'en' as const,
        item: items,
    };
}

async function fetchFeed(section: (typeof sections)[string], limit: number): Promise<DataItem[]> {
    const feed = await parser.parseURL(`${rootUrl}/feed/rss?themes=${section.theme}`);
    return feed.items.slice(0, limit).flatMap((item) =>
        item.title && item.link
            ? [
                  {
                      title: item.title,
                      link: item.link,
                      pubDate: item.isoDate ?? item.pubDate,
                      description: item.content,
                      author: item.creator,
                      category: [section.title, ...(item.categories ?? [])],
                  },
              ]
            : []
    );
}

async function fetchListing(section: (typeof sections)[string], limit: number): Promise<DataItem[]> {
    const currentUrl = new URL(section.path, rootUrl).href;
    const html = await ofetch(currentUrl);
    const $ = load(html);
    const items = new Map<string, DataItem>();
    $('a[href]').each((_, element) => {
        if (items.size >= limit) {
            return;
        }
        const href = $(element).attr('href');
        if (!href) {
            return;
        }
        const link = new URL(href, rootUrl);
        const date = link.pathname.match(/^\/(20\d{2})\/(\d{2})\/(\d{2})\//);
        if (!date) {
            return;
        }
        items.set(link.href, {
            title: $(element).text().trim(),
            link: link.href,
            pubDate: parseDate(`${date[1]}-${date[2]}-${date[3]}`),
            category: [section.title],
        });
    });
    return items
        .values()
        .filter((item) => item.title)
        .toArray();
}
