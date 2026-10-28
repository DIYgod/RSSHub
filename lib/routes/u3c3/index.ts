import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

function getPublicationDate(value: string): Date | undefined {
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
        return;
    }
    const date = parseDate(value, 'YYYY-MM-DD HH:mm:ss', true);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function getPreviewItem(item: DataItem & { link: string }): Promise<DataItem> {
    const details = await cache.tryGet<Pick<DataItem, 'description'>>(item.link, async () => {
        const { data: response } = await got(item.link);
        const $ = load(response);
        return { description: $('div.panel-footer > img:first-child').parent().html() };
    });
    return { ...item, description: details.description };
}

export const route: Route = {
    path: ['/search/:keyword/:preview?', '/:type?/:preview?'],
    categories: ['multimedia'],
    example: '/u3c3/search/新片速递',
    parameters: {
        type: 'Content type: U3C3, Video, Photo, Book, Game, Software, or Other; the homepage is used when omitted',
        keyword: 'Search keyword',
        preview: 'Show image preview, off by default, non empty value means on',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['storytellerF'],
    handler,
};

async function handler(ctx) {
    const { type, keyword, preview } = ctx.req.param();
    // should be:
    // undefined
    // U3C3
    // Videos
    // Photo
    // Book
    // Game
    // Software
    // Other
    const rootUrl = 'https://www.u3c3.com';
    let currentUrl;
    let title;
    if (keyword) {
        // u3c3 search needs an anti-scrape token: its search box (search21() JS on the
        // homepage) redirects to /?search2=<token>&search=<kw>. The token rotates and is
        // embedded in the page, so scrape it live; hitting /?search=<kw> alone silently
        // returns the homepage listing (the long-standing "always 國產原创" bug).
        const { data: home } = await got(rootUrl);
        const varName = home.match(/search2="\s*\+\s*(\w+)/)?.[1];
        const token = varName ? home.match(new RegExp(String.raw`(?<!/)\bvar\s+${varName}\s*=\s*"([^"]+)"`))?.[1] : undefined;
        currentUrl = token ? `${rootUrl}/?search2=${token}&search=${encodeURIComponent(keyword)}` : `${rootUrl}/?search=${encodeURIComponent(keyword)}`;
        title = `search ${keyword} - u3c3`;
    } else if (type === undefined) {
        currentUrl = rootUrl;
        title = 'home - u3c3';
    } else {
        currentUrl = `${rootUrl}/?type=${type}&p=1`;
        title = `${type} - u3c3`;
    }

    const response = await got(currentUrl);
    const $ = load(response.data);

    const list = $('body > div.container > div.table-responsive > table > tbody > tr')
        .toArray()
        // Skip u3c3's sticky promo rows that appear on every page (home AND search):
        // category-nav rows (href="/?type=…") and external ad rows (href="http://…",
        // e.g. the "國產原创" entries). Real torrent rows always link to /view.
        .filter((el) => $(el).find('td:nth-of-type(2) > a').attr('href')?.startsWith('/view'))
        .map((el): DataItem & { link: string } => {
            const item = $(el);
            const a = item.find('td:nth-of-type(2) > a');
            const guid = rootUrl + a.attr('href');
            const torrentUrl = item.find('td:nth-of-type(3) > a:first-child').attr('href');
            return {
                title: a.attr('title')!,
                guid,
                link: guid,
                pubDate: getPublicationDate(item.find('td:nth-of-type(5)').text()),
                enclosure_url: torrentUrl ? new URL(torrentUrl, rootUrl).href : undefined,
                enclosure_type: 'application/x-bittorrent',
            };
        });

    const items = preview ? await pMap(list, getPreviewItem, { concurrency: 3 }) : list;

    return {
        title,
        description: title,
        link: currentUrl,
        item: items,
    };
}
