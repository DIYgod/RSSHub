import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://www.oaktreecapital.com';
const INSIGHTS_URL = `${BASE_URL}/insights`;
const DEFAULT_LIMIT = 30;

type Insight = {
    Title: string;
    InsightDate: string;
    IsoDate: string;
    PosterImageSourceUrl: string;
    MoreLink: string;
    CategoryText: string;
};

const getArticleContent = ($: CheerioAPI): string | undefined => {
    const content = $('.article-content > .row > .col-md-8').first();
    if (content.length === 0) {
        return;
    }

    // drop the title (already exposed as the item title) and the podcast/video player furniture
    content.find('h1, .podcast-poster, .podcast-logos, .d-flex.justify-content-between, #mediaPlayer').remove();
    while (content.children('br').first().length > 0) {
        content.children('br').first().remove();
    }

    return content.html() ?? undefined;
};

const parseItem = async (item: Insight): Promise<DataItem> => {
    // a few archived links contain line breaks inside the URL
    const link = new URL(item.MoreLink.replaceAll(/\s/g, ''), BASE_URL).href;

    const dataItem: DataItem = {
        title: item.Title,
        link,
        pubDate: parseDate(item.InsightDate || item.IsoDate),
        image: item.PosterImageSourceUrl,
        category: [item.CategoryText],
    };

    // press mentions point to external websites and PDFs cannot be rendered inline
    if (!link.startsWith(`${INSIGHTS_URL}/`)) {
        return dataItem;
    }

    return await cache.tryGet(link, async () => {
        const html = await ofetch(link);
        return {
            ...dataItem,
            description: getArticleContent(load(html)),
        };
    });
};

async function handler(ctx: Context): Promise<Data> {
    const limit = Number(ctx.req.query('limit') ?? DEFAULT_LIMIT);

    const html = await ofetch(INSIGHTS_URL);
    const $ = load(html);
    const rawList = $('.insights-list[data-items]').first().attr('data-items');
    if (!rawList) {
        throw new Error('Oaktree insights list not found, the page structure may have changed');
    }

    const list: Insight[] = JSON.parse(rawList);
    const items = await Promise.all(list.slice(0, limit).map((item) => parseItem(item)));

    return {
        title: 'Insights - Oaktree Capital',
        link: INSIGHTS_URL,
        language: 'en',
        item: items,
    };
}

export const route: Route = {
    path: '/insights',
    name: 'Insights',
    url: 'www.oaktreecapital.com/insights',
    maintainers: ['argsno'],
    handler,
    example: '/oaktree/insights',
    description:
        'Includes Howard Marks memos, market commentary, education and press mentions. The full text of each insight is fetched from its detail page, while press items link to external websites. The latest 30 entries are returned by default, use the `limit` parameter for more.',
    categories: ['finance'],
    radar: [
        {
            source: ['www.oaktreecapital.com/insights'],
        },
    ],
};
