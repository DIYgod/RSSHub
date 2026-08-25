import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const rootUrl = 'https://www.channelnewsasia.com';
const sections: Record<string, { title: string; path: string; feedCategory?: string }> = {
    'top-stories': { title: 'Top Stories', path: '/' },
    asia: { title: 'Asia', path: '/asia', feedCategory: '6511' },
    'east-asia': { title: 'East Asia', path: '/east-asia' },
    singapore: { title: 'Singapore', path: '/singapore', feedCategory: '10416' },
    world: { title: 'World', path: '/world', feedCategory: '6311' },
    business: { title: 'Business', path: '/business', feedCategory: '6936' },
};

export const route: Route = {
    path: '/category/:section',
    categories: ['traditional-media'],
    example: '/channelnewsasia/category/asia',
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
        throw new InvalidParameterError(`Unsupported CNA section: ${sectionId}`);
    }
    const limit = Math.min(Number.parseInt(ctx.req.query('limit') || '20'), 50);
    const items = sectionId === 'east-asia' ? await fetchEastAsia(section, limit) : await fetchFeed(section, limit);

    return {
        title: `CNA - ${section.title}`,
        link: new URL(section.path, rootUrl).href,
        language: 'en' as const,
        item: items,
    };
}

async function fetchFeed(section: (typeof sections)[string], limit: number): Promise<DataItem[]> {
    const feedUrl = new URL('/api/v1/rss-outbound-feed?_format=xml', rootUrl);
    if (section.feedCategory) {
        feedUrl.searchParams.set('category', section.feedCategory);
    }
    const feed = await parser.parseURL(feedUrl.href);
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

async function fetchEastAsia(section: (typeof sections)[string], limit: number): Promise<DataItem[]> {
    const currentUrl = new URL(section.path, rootUrl).href;
    const html = await ofetch(currentUrl);
    const $ = load(html);
    const links = new Map<string, string>();
    $('a[href^="/east-asia/"]').each((_, element) => {
        if (links.size < limit) {
            links.set(new URL($(element).attr('href')!, rootUrl).href, $(element).text().trim());
        }
    });
    return pMap(
        [...links],
        ([link, listingTitle]) =>
            cache.tryGet(link, async () => {
                const detailHtml = await ofetch(link);
                const detail = load(detailHtml);
                const title = detail('meta[property="og:title"]').attr('content') ?? detail('h1').first().text().trim() ?? listingTitle;
                const published = detail('meta[property="article:published_time"]').attr('content') ?? detail('time[datetime]').first().attr('datetime');
                return {
                    title,
                    link,
                    pubDate: published ? parseDate(published) : undefined,
                    description: detail('[itemprop="articleBody"], article').first().html() ?? undefined,
                    category: [section.title],
                };
            }),
        { concurrency: 8 }
    );
}
