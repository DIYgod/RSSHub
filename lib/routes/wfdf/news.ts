import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['sport'],
    example: '/wfdf/news',
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
            source: ['wfdf.sport/news/', 'wfdf.sport/'],
        },
    ],
    name: 'News',
    maintainers: ['HankChow'],
    handler,
    url: 'wfdf.sport/news/',
};

function parseGmtDate(value?: string | null) {
    if (!value) {
        return;
    }
    const date = parseDate(value.replace(/Z$/, ''), ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSS'], true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}

function getArticleBody(content: string) {
    if (!content.includes('single-post-date')) {
        return content;
    }
    const $ = load(content, { xml: { xmlMode: false, decodeEntities: false, withStartIndices: true, withEndIndices: true } }, false);
    const ranges = $('.single-post-date')
        .toArray()
        .flatMap(({ startIndex, endIndex }) => (typeof startIndex === 'number' && typeof endIndex === 'number' ? [[startIndex, endIndex + 1]] : []))
        .sort((a, b) => b[0] - a[0]);
    return ranges.reduce((body, [start, end]) => body.slice(0, start) + body.slice(end), content);
}

async function handler(ctx) {
    const baseUrl = 'https://wfdf.sport';
    const { data: response } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: Math.min(getRouteLimit(ctx, 100), 100),
            _embed: 1,
        },
    });

    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        guid: item.guid.rendered,
        description: getArticleBody(item.content.rendered),
        pubDate: parseGmtDate(item.date_gmt),
        author: item._embedded.author[0].name,
        category: item._embedded?.['wp:term']
            ?.flat()
            .map((term: { name?: string }) => term.name)
            .filter((name): name is string => typeof name === 'string'),
    }));

    return {
        title: 'WFDF News',
        link: `${baseUrl}/news/`,
        image: `${baseUrl}/favicon.ico`,
        description: 'WFDF 新闻',
        item: items,
    };
}
