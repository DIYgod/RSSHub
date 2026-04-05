import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const author = 'Peter Wunder';
const rootUrl = 'https://projects.peterwunder.de';
const currentUrl = new URL('/achievements/', rootUrl).href;
const icon = new URL('/achievements/images/touchicon.png', rootUrl).href;
const defaultLimit = 20;

type BadgeItem = DataItem & {
    link: string;
    title: string;
};

function absolutizeImageSource($: CheerioAPI, itemUrl: string) {
    $('article')
        .first()
        .find('[src]')
        .each((_, element) => {
            const value = $(element).attr('src');

            if (value) {
                $(element).attr('src', new URL(value, itemUrl).href);
            }
        });
}

function extractBadgeDescription($: CheerioAPI) {
    const article = $('article').first();

    if (!article.length) {
        return;
    }

    article.find('h1, script, style, noscript').remove();

    return article.html() ?? undefined;
}

function extractListItems($: CheerioAPI, limit: number): BadgeItem[] {
    return $('section.badges a.badge')
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const badge = $(element);
            const href = badge.attr('href');
            const title = badge.find('.title').text().trim();

            if (!href || !title) {
                return null;
            }

            const image = badge.find('img').attr('src');
            const visibleStart = badge.attr('data-vis-start');

            return {
                title,
                link: new URL(href, rootUrl).href,
                pubDate: visibleStart ? parseDate(visibleStart) : undefined,
                image: image ? new URL(image, rootUrl).href : undefined,
            };
        })
        .filter(Boolean) as BadgeItem[];
}

function fetchBadge(item: BadgeItem) {
    return cache.tryGet(item.link, async () => {
        const { data: response } = await got(item.link);
        const $: CheerioAPI = load(response);

        const title = $('article h1').first().text().trim();
        const visibleStart = $('ul.metadata li').first().find('time.date').first().attr('datetime');
        const image = $('meta[property="og:image"]').attr('content');
        absolutizeImageSource($, item.link);

        return {
            ...item,
            title: title || item.title,
            description: extractBadgeDescription($),
            pubDate: visibleStart ? parseDate(visibleStart) : item.pubDate,
            author,
            image: image ? new URL(image, rootUrl).href : item.image,
        };
    });
}

const handler: Route['handler'] = async (ctx) => {
    const limit = Math.max(Number.parseInt(ctx.req.query('limit') ?? '', 10) || defaultLimit, 1);

    const { data: response } = await got(currentUrl);
    const $: CheerioAPI = load(response);

    const items = await Promise.all(extractListItems($, limit).map((item) => fetchBadge(item)));

    return {
        title: 'All Activity Challenges - New Badges',
        description: "Latest badge pages from Peter Wunder's All Activity Challenges catalog. The website's own Atom feed was discontinued on August 20, 2024, so this route follows the latest entries directly from the site.",
        link: currentUrl,
        item: items,
        language: 'en',
        author,
        icon,
        logo: icon,
        image: icon,
    };
};

export const route: Route = {
    path: '/achievements',
    categories: ['other'],
    view: ViewType.Pictures,
    example: '/peterwunder/achievements',
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
            source: ['projects.peterwunder.de/achievements'],
        },
    ],
    name: 'New Badges',
    maintainers: ['LinxHex'],
    description: "Latest badge pages from Peter Wunder's All Activity Challenges catalog. `pubDate` uses the first 'Visible in the app' date because the site does not expose a publication timestamp.",
    handler,
    url: 'projects.peterwunder.de/achievements',
};
