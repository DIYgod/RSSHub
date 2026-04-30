import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

const getTitleFromElement = ($element: Cheerio<Element>): string | undefined => $element.attr('aria-label') || $element.find('img').attr('alt') || $element.text().trim() || undefined;

const getImageFromElement = ($element: Cheerio<Element>): string | undefined =>
    $element.find('img').attr('src') || $element.find('img').attr('data-src') || $element.find('img').attr('data-lazy-src') || $element.find('img').attr('data-image-src');

export const route: Route = {
    path: '/search/:keyword',
    categories: ['picture'],
    view: ViewType.Pictures,
    description:
        'Image search results on the first page only. Radar cannot extract the `phrase` query string; subscribe with `/gettyimages/search/:keyword` manually (e.g. `/gettyimages/search/kangaroo`). The listing does not provide reliable publish dates.',
    url: 'www.gettyimages.com.au',
    example: '/gettyimages/search/kangaroo',
    parameters: {
        keyword: 'Search keyword',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.gettyimages.com.au/search/2/image'],
            target: '/search/:keyword',
        },
    ],
    name: 'Search',
    maintainers: ['siyan'],
    handler,
};

async function handler(ctx: Context) {
    const keyword = ctx.req.param('keyword');
    if (!keyword) {
        throw new Error('Missing required parameter: keyword');
    }

    const baseUrl = 'https://www.gettyimages.com.au';
    const searchUrl = `${baseUrl}/search/2/image?phrase=${encodeURIComponent(keyword)}`;

    const response = await ofetch<string>(searchUrl, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $: CheerioAPI = load(response);

    const seen = new Set<string>();
    const list: DataItem[] = [];
    for (const element of $('a[href^="/detail/"]').toArray()) {
        const $element: Cheerio<Element> = $(element);
        const href = $element.attr('href');
        if (!href) {
            continue;
        }

        const link = new URL(href, baseUrl);
        link.search = '';
        link.hash = '';
        const normalizedLink = link.toString();

        if (seen.has(normalizedLink)) {
            continue;
        }
        seen.add(normalizedLink);

        const title = getTitleFromElement($element) || normalizedLink;
        const image = getImageFromElement($element);

        list.push({
            title,
            link: normalizedLink,
            guid: normalizedLink,
            description: image ? `<img src="${image}">` : undefined,
        });
    }

    return {
        title: `Getty Images Australia - ${keyword}`,
        link: searchUrl,
        item: list,
    };
}
