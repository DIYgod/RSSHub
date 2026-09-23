import { load } from 'cheerio';

import type { Route } from '@/types';

import { baseUrl, fetchListing, parsePreviewsListing, parseSearchListing, previewsGenre, resolvePubDate } from './utils';

async function handler(ctx) {
    let { date } = ctx.req.param();
    if (!date || !/^\d{6}$/.test(date)) {
        const now = new Date();
        date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(4, 6));

    // Source 1: the site now serves recent months as a search result, see `previewsGenre`
    const searchLink = `${baseUrl}/search?genre=${encodeURIComponent(previewsGenre)}&date=${encodeURIComponent(`${year} 年 ${month} 月`)}`;
    const searchResult = await fetchListing(searchLink);
    if (searchResult.status < 400) {
        const $search = load(searchResult.html);
        const item = parseSearchListing($search).map((entry) => ({
            title: entry.title,
            link: entry.link,
            description: entry.description,
            pubDate: resolvePubDate(entry.dateText, year, month),
        }));
        if (item.length > 0) {
            return {
                title: `Hanime1 ${date} 新番`,
                link: searchLink,
                item,
            };
        }
    }

    // Source 2: the legacy `/previews/YYYYMM` page, which returns 500 for recent months but still serves older ones
    const previewsLink = `${baseUrl}/previews/${date}`;
    const previewsResult = await fetchListing(previewsLink);
    if (previewsResult.status < 400) {
        const $previews = load(previewsResult.html);
        const item = parsePreviewsListing($previews);
        if (item.length > 0) {
            return {
                title: `Hanime1 ${date} 新番`,
                link: previewsLink,
                item,
            };
        }
    }

    throw new Error(`Failed to load the Hanime1 ${date} preview list: the search page responded with HTTP ${searchResult.status} and returned no result, and the legacy preview page responded with HTTP ${previewsResult.status}. The month may not be available yet, or the site is misbehaving.`);
}

export const route: Route = {
    path: '/previews/:date?',
    name: '每月新番',
    maintainers: ['kjasn'],
    example: '/hanime1/previews/202504',
    categories: ['anime'],
    parameters: { date: { description: '日期格式为 `YYYYMM`，默认值当月' } },
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
            source: ['hanime1.me/previews/:date', 'hanime1.me/previews'],
            target: '/previews/:date',
        },
    ],
    handler,
};
