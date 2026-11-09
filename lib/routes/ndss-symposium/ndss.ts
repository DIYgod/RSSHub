import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.ndss-symposium.org';
const apiUrl = rootUrl + '/wp-json/wp/v2/pages?slug=accepted-papers';
const detailTtl = 7 * 24 * 60 * 60;
const detailConcurrency = 6;
const descriptionSelectors = ['.paper-data', '.paper-abstract', '.abstract', '#abstract'];

type AcceptedPaperPage = {
    link?: string;
    date?: string;
    date_gmt?: string;
    content?: { rendered?: string };
};

type ParseState = {
    seen: Set<string>;
    programUrl?: string;
};

export const route: Route = {
    path: '/ndss/:abstract?',
    categories: ['journal'],
    example: '/ndss-symposium/ndss',
    parameters: {
        abstract: {
            description: 'Set to `1` to fetch abstracts for every accepted paper. The default `0` returns titles and authors only.',
            default: '0',
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
    radar: [
        {
            source: ['ndss-symposium.org/'],
        },
    ],
    name: 'Accepted papers',
    maintainers: ['ZeddYu', 'yuguorui'],
    handler,
    url: 'ndss-symposium.org/',
    description: 'Set `abstract` to `1` to include paper abstracts, taken from the detailed program page or, when a paper is missing there, from its own page.',
};

async function handler(ctx: Context): Promise<Data> {
    const pages = await cache.tryGet(apiUrl, async () => (await got(apiUrl)).data as AcceptedPaperPage[], 24 * 60 * 60);
    const state: ParseState = { seen: new Set() };
    let items = (Array.isArray(pages) ? pages : []).flatMap((page) => parsePage(page, state));

    const limit = Math.trunc(Number(ctx.req.query('limit')));
    if (Number.isFinite(limit) && limit > 0) {
        items = items.slice(0, limit);
    }

    if (ctx.req.param('abstract') === '1') {
        const abstracts = await getProgramAbstracts(state.programUrl);
        items = await pMap(
            items,
            async (item) => ({
                ...item,
                description: abstracts.get(normalizeTitle(item.title)) ?? (await getPaperAbstract(item)),
            }),
            { concurrency: detailConcurrency }
        );
    }

    return {
        title: 'NDSS',
        link: rootUrl,
        description: 'The Network and Distributed System Security (NDSS) Symposium Accepted Papers',
        item: items,
    };
}

function parsePage(page: AcceptedPaperPage, state: ParseState): DataItem[] {
    const pageUrl = page.link ?? rootUrl;
    const html = page.content?.rendered;
    if (!html) {
        return [];
    }

    const $ = load(html);
    const pubDate = page.date_gmt ? parseDate(page.date_gmt + 'Z') : page.date ? parseDate(page.date) : undefined;
    const year = page.link?.match(/\/ndss(\d{4})\/accepted-papers\/?$/i)?.[1];
    state.programUrl ??= year ? rootUrl + '/ndss-program/symposium-' + year + '/' : undefined;

    const makeItem = (title: string, author: string, href?: string): DataItem[] =>
        title.trim()
            ? [
                  {
                      title,
                      author,
                      link: uniqueLink(href, pageUrl, title, state.seen),
                      pubDate,
                  },
              ]
            : [];

    const modern = $('.pt-cv-content-item')
        .toArray()
        .flatMap((element) => {
            const $item = $(element);
            const $title = $item.find('.pt-cv-title a').first();
            return makeItem($title.text(), $item.find('.pt-cv-ctf-display_authors .pt-cv-ctf-value').text().trim(), $title.attr('href'));
        });
    if (modern.length > 0) {
        return modern;
    }

    const legacy = $('div h3')
        .toArray()
        .flatMap((element) => {
            const $item = $(element);
            return makeItem($item.text(), $item.siblings().text().trim().replaceAll('\n', '').replaceAll(/\s+/g, ' '), $item.siblings('a').attr('href'));
        });
    if (legacy.length > 0) {
        return legacy;
    }

    return $('p strong')
        .toArray()
        .flatMap((element) => {
            const $item = $(element);
            const author = $item
                .parent()
                .contents()
                .filter((_, node) => node.nodeType === 3)
                .text()
                .trim()
                .replaceAll('\n', '')
                .replaceAll(/\s+/g, ' ');
            return makeItem($item.text(), author);
        });
}

function uniqueLink(href: string | undefined, pageUrl: string, title: string, seen: Set<string>) {
    let baseLink = pageUrl + '#' + title;
    try {
        if (href) {
            baseLink = new URL(href, pageUrl).href;
        }
    } catch {
        // Keep the list-page fragment fallback.
    }

    let link = baseLink;
    for (let suffix = 2; seen.has(link); suffix++) {
        const url = new URL(baseLink);
        url.hash = (url.hash ? url.hash.slice(1) + '-' : '') + suffix;
        link = url.href;
    }
    seen.add(link);
    return link;
}

async function getProgramAbstracts(programUrl: string | undefined) {
    if (!programUrl) {
        logger.warn('NDSS: could not determine the detailed program URL; falling back to per-paper detail pages.');
        return new Map<string, string>();
    }

    try {
        const entries = await cache.tryGet(
            programUrl,
            async () => {
                const response = await got(programUrl);
                const $ = load(String(response.body ?? ''));
                const parsed = new Map<string, string>();
                $('li.list-group-item').each((_, element) => {
                    const $item = $(element);
                    const $paper = $item.find('a[href*="/ndss-paper/"]').first();
                    const $abstract = $item.find('[id^="pid"]').first();
                    if (!$paper.text().trim() || !$abstract.length) {
                        return;
                    }

                    const description = cleanDescription($, $abstract);
                    if (!description) {
                        return;
                    }

                    const titleKey = normalizeTitle($paper.text());
                    if (titleKey && !parsed.has(titleKey)) {
                        parsed.set(titleKey, description);
                    }
                });
                return Object.fromEntries(parsed);
            },
            detailTtl
        );

        const abstracts = new Map(Object.entries(entries));
        if (abstracts.size === 0) {
            logger.warn('NDSS: no abstracts found on detailed program page ' + programUrl + '; falling back to per-paper detail pages.');
        }
        return abstracts;
    } catch (error) {
        logger.warn('NDSS: failed to load detailed program page ' + programUrl + ': ' + errorText(error) + '; falling back to per-paper detail pages.');
        return new Map<string, string>();
    }
}

async function getPaperAbstract(item: DataItem) {
    const detailUrl = item.link && (item.link.includes('/ndss-paper/') || !item.link.includes('#')) ? item.link.replace(/#.*$/, '') : undefined;
    if (!item.link || !detailUrl) {
        return '';
    }

    try {
        const { description } = await cache.tryGet(
            item.link,
            async () => {
                const response = await got(detailUrl);
                const $ = load(String(response.body ?? ''));
                const content = extractDescription($, item.author);
                if (!content) {
                    logger.warn('NDSS: no abstract found for "' + item.title + '" at ' + detailUrl + '; keeping the item without a description.');
                }
                return { description: content };
            },
            detailTtl
        );
        return description;
    } catch (error) {
        logger.warn('NDSS: failed to fetch detail page ' + detailUrl + ' for "' + item.title + '": ' + errorText(error) + '; keeping the item without a description.');
        return '';
    }
}

function extractDescription($: CheerioAPI, author?: DataItem['author']) {
    for (const selector of descriptionSelectors) {
        const $candidate = $(selector).first();
        if (!$candidate.length) {
            continue;
        }
        const description = cleanDescription($, $candidate, author);
        if (description) {
            return description;
        }
    }

    return ($('meta[name="description"]').attr('content') ?? $('meta[property="og:description"]').attr('content') ?? '').trim();
}

function cleanDescription($: CheerioAPI, $element: Cheerio<AnyNode>, author?: DataItem['author']) {
    const $content = $element;
    $content.find('script, style, nav, footer, form, header, .paper-authors, .authors, .author, .paper-author, .share, .social-share').remove();

    const authorText = normalize(Array.isArray(author) ? author.map((entry) => entry.name).join(', ') : (author ?? ''));
    $content.find('p').each((_, element) => {
        const $paragraph = $(element);
        const text = normalize($paragraph.text());
        const strong = $paragraph.find('strong').text().trim();
        if (!text || (strong && normalize(strong) === text) || (authorText && text === authorText) || /^(?:authors?|by)\b/i.test(strong)) {
            $paragraph.remove();
        }
    });

    return $content.text().trim() ? ($content.html()?.trim() ?? '') : '';
}

function normalize(value: string) {
    return value.normalize('NFKC').replaceAll(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeTitle(title: string) {
    return normalize(title).replaceAll(/[^\p{L}\p{N}]+/gu, '');
}

const errorText = (cause: unknown) => (cause instanceof Error ? cause.message : String(cause));
