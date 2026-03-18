import type { Cheerio, Element } from 'cheerio';
import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

type Edition = {
    title?: string;
    link: string;
};

type Article = {
    title: string;
    link: string;
    category?: string[];
    dateText?: string;
};

const rootUrl = 'https://www.rmfyb.com';
const rootPageUrl = rootUrl + '/';

const fetchPage = (url: string) =>
    ofetch<string, 'text'>(url, {
        responseType: 'text',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

const extractDateText = ($: ReturnType<typeof load>) => {
    const raw = $('.operate_data').first().text();
    const match = raw.match(/(\d{4}年\d{2}月\d{2}日)/);

    return match?.[1];
};

const extractDateTextFromUrl = (url: string) => {
    const match = url.match(/\/content\/(\d{4})(\d{2})\/(\d{2})\//);

    return match ? `${match[1]}年${match[2]}月${match[3]}日` : undefined;
};

const resolveRelativeUrl = (url: string, baseUrl: string) => {
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('javascript:') || url.startsWith('#')) {
        return url;
    }

    return new URL(url, baseUrl).href;
};

const resolveRelativeLinks = ($: ReturnType<typeof load>, content: Cheerio<Element>, baseUrl: string) => {
    content.find('img').each((_, element) => {
        const item = $(element);
        const src = item.attr('src');

        if (src) {
            item.attr('src', resolveRelativeUrl(src, baseUrl));
        }
    });

    content.find('a').each((_, element) => {
        const item = $(element);
        const href = item.attr('href');

        if (href) {
            item.attr('href', resolveRelativeUrl(href, baseUrl));
        }
    });
};

const parseEditionList = ($: ReturnType<typeof load>, baseUrl: string): Edition[] =>
    $('.directory_list .directory_item')
        .toArray()
        .map((element) => {
            const item = $(element);
            const link = item.find('a').first().attr('href');

            if (!link || !link.startsWith('/content/')) {
                return null;
            }

            const title = item.find('.directory_word').first().text().trim();

            return {
                title: title || undefined,
                link: new URL(link, baseUrl).href,
            };
        })
        .filter((item): item is Edition => item !== null);

const parseArticleList = ($: ReturnType<typeof load>, baseUrl: string, editionTitle?: string, issueDateText?: string): Article[] =>
    $('.new_item_word a')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');
            const title = item.text();

            if (!href || !href.startsWith('/content/') || !title) {
                return null;
            }

            return {
                title,
                link: new URL(href, baseUrl).href,
                category: editionTitle ? [editionTitle] : undefined,
                dateText: issueDateText,
            };
        })
        .filter((item): item is Article => item !== null);

const extractDetail = (html: string, baseUrl: string, fallbackTitle: string, fallbackDate?: string) => {
    const $ = load(html);
    const title = $('p.title').first().text() || fallbackTitle;
    const content = $('.conten_text_box').first();

    resolveRelativeLinks($, content, baseUrl);

    const contentHtml = content.html();
    const metaDescription = $('meta[name="description"]').attr('content');
    const description = contentHtml && contentHtml.trim() ? contentHtml : metaDescription?.trim() || undefined;
    const dateText = extractDateText($) ?? extractDateTextFromUrl(baseUrl) ?? fallbackDate;
    const pubDate = dateText ? timezone(parseDate(dateText, 'YYYY年MM月DD日'), +8) : undefined;

    return {
        title,
        description,
        pubDate,
    };
};

async function handler(ctx) {
    const rootHtml = await fetchPage(rootPageUrl);
    const rootPage = load(rootHtml);
    const issueDateText = extractDateText(rootPage);
    const editions = parseEditionList(rootPage, rootPageUrl);

    if (!editions.length) {
        throw new Error('No edition list found on the homepage.');
    }

    const editionResults = await Promise.all(
        editions.map(async (edition) => {
            const editionHtml = await fetchPage(edition.link);
            const $ = load(editionHtml);
            const editionTitle = $('.news_bot_left').first().text().trim() || edition.title;
            const editionDateText = extractDateText($) ?? extractDateTextFromUrl(edition.link) ?? issueDateText;

            return parseArticleList($, edition.link, editionTitle, editionDateText);
        })
    );

    const rawItems = editionResults.flat();
    const seenLinks = new Set<string>();
    const uniqueItems = rawItems.filter((item) => {
        if (seenLinks.has(item.link)) {
            return false;
        }

        seenLinks.add(item.link);
        return true;
    });

    const limitParam = ctx.req.query('limit');
    const limit = limitParam ? Number.parseInt(limitParam, 10) : NaN;
    const itemsToFetch = Number.isNaN(limit) ? uniqueItems : uniqueItems.slice(0, limit);

    const items = await Promise.all(
        itemsToFetch.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailHtml = await fetchPage(item.link);
                const { dateText, ...baseItem } = item;
                const detail = extractDetail(detailHtml, item.link, baseItem.title, dateText);

                return {
                    ...baseItem,
                    ...detail,
                };
            })
        )
    );

    return {
        title: '人民法院报数字报',
        link: rootPageUrl,
        item: items,
    };
}

export const route: Route = {
    path: '/newspaper',
    categories: ['traditional-media'],
    example: '/rmfyb/newspaper',
    radar: [
        {
            source: ['www.rmfyb.com/'],
            target: '/newspaper',
        },
    ],
    name: '数字报',
    maintainers: ['ZHA30'],
    handler,
    description: '抓取人民法院报数字报最新一期全部版面文章。',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};
